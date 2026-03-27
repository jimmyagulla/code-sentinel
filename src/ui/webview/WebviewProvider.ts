import * as vscode from 'vscode';
import * as path from 'path';
import type { Container } from '../../infrastructure/di/Container';
import type { NotesPanelNotesMessage } from '../../application/dtos/notesPanelMessage';
import { createNoteId } from '../../domain/value-objects/NoteId';
import { DomainError } from '../../domain/errors/DomainErrors';

/** Align webview `.dark` with VS Code active theme (Light / Dark / HC). */
function vscodeThemeIsDark(): boolean {
  const k = vscode.window.activeColorTheme.kind;
  return k === vscode.ColorThemeKind.Dark || k === vscode.ColorThemeKind.HighContrast;
}

export type WebviewMessage =
  | { type: 'ready' }
  | { type: 'navigate'; filePath: string; line: number }
  | { type: 'deleteNote'; noteId: string }
  | {
      type: 'updateNote';
      noteId: string;
      content: string;
      priority: string;
      noteType: string;
      scope: string;
      status: string;
    };

/** Controller for the CodeSentinel notes UI (editor tab webview + Explorer sidebar view). */
export interface NotesWebviewController {
  /** Push latest notes to every open notes webview. */
  refresh(): void;
  /** Open or focus the notes tab in the editor area. */
  open(): void;
}

type NotesScopeAttr = 'workspace' | 'currentFile';

export class NotesWebviewPanelController implements NotesWebviewController, vscode.WebviewViewProvider {
  public static readonly viewType = 'codesentinel.notes';
  public static readonly currentFileNotesViewId = 'codesentinel.currentFileNotes';

  private panel?: vscode.WebviewPanel;
  private sidebarWebview?: vscode.Webview;
  private themeSubscription?: vscode.Disposable;
  private activeEditorSubscription?: vscode.Disposable;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly container: Container,
    private readonly onWorkspaceUiRefresh?: () => void
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void | Thenable<void> {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview')],
    };
    webviewView.webview.html = this.getHtml(webviewView.webview, { notesScope: 'currentFile' });

    this.sidebarWebview = webviewView.webview;
    this.ensureThemeSubscription();
    this.ensureActiveEditorSubscription();
    this.wireWebview(webviewView.webview);

    this.postThemeToWebview(webviewView.webview);
    this.postActiveFileToSidebar();

    webviewView.onDidDispose(() => {
      if (this.sidebarWebview === webviewView.webview) {
        this.sidebarWebview = undefined;
      }
      this.releaseActiveEditorSubscriptionIfNoSidebar();
      this.releaseThemeSubscriptionIfUnused();
    });
  }

  open(): void {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Active, false);
      void this.pushNotes();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      NotesWebviewPanelController.viewType,
      'CodeSentinel Notes',
      { viewColumn: vscode.ViewColumn.Active, preserveFocus: false },
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview')],
      }
    );

    this.panel.webview.html = this.getHtml(this.panel.webview);

    this.ensureThemeSubscription();
    this.wireWebview(this.panel.webview);

    this.postThemeToWebview(this.panel.webview);

    this.panel.onDidDispose(() => {
      this.panel = undefined;
      this.releaseThemeSubscriptionIfUnused();
    });
  }

  refresh(): void {
    void this.pushNotes();
  }

  private ensureThemeSubscription(): void {
    if (this.themeSubscription) {
      return;
    }
    this.themeSubscription = vscode.window.onDidChangeActiveColorTheme(() => {
      this.postThemeToAllWebviews();
    });
  }

  private releaseThemeSubscriptionIfUnused(): void {
    if (!this.panel && !this.sidebarWebview) {
      this.themeSubscription?.dispose();
      this.themeSubscription = undefined;
    }
  }

  private ensureActiveEditorSubscription(): void {
    if (this.activeEditorSubscription) {
      return;
    }
    this.activeEditorSubscription = vscode.window.onDidChangeActiveTextEditor(() => {
      this.postActiveFileToSidebar();
    });
  }

  private releaseActiveEditorSubscriptionIfNoSidebar(): void {
    if (!this.sidebarWebview) {
      this.activeEditorSubscription?.dispose();
      this.activeEditorSubscription = undefined;
    }
  }

  private wireWebview(webview: vscode.Webview): void {
    webview.onDidReceiveMessage(async (raw: unknown) => {
      await this.handleMessage(webview, raw as WebviewMessage);
    });
  }

  private async handleMessage(webview: vscode.Webview, msg: WebviewMessage): Promise<void> {
    if (msg.type === 'ready') {
      await this.pushNotes();
      this.postActiveFileToSidebar();
      return;
    }
    if (msg.type === 'navigate') {
      try {
        const uri = vscode.Uri.file(path.join(this.container.workspaceRoot, msg.filePath));
        const doc = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(doc, vscode.ViewColumn.Active);
        const pos = new vscode.Position(Math.max(0, msg.line - 1), 0);
        editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
        editor.selection = new vscode.Selection(pos, pos);
      } catch (e) {
        const detail = e instanceof Error ? e.message : String(e);
        void vscode.window.showErrorMessage(`Could not open ${msg.filePath}: ${detail}`);
      }
      return;
    }
    if (msg.type === 'deleteNote') {
      const res = await this.container.deleteNote.execute({ noteId: createNoteId(msg.noteId) });
      if (res.success) {
        await this.pushNotes();
        this.onWorkspaceUiRefresh?.();
      } else {
        void vscode.window.showWarningMessage('Note not found');
      }
      return;
    }
    if (msg.type === 'updateNote') {
      try {
        await this.container.updateNote.execute({
          noteId: createNoteId(msg.noteId),
          content: msg.content,
          priority: msg.priority,
          type: msg.noteType,
          scope: msg.scope,
          status: msg.status,
        });
        await this.pushNotes();
        this.onWorkspaceUiRefresh?.();
        void webview.postMessage({ type: 'noteUpdated', success: true });
      } catch (e) {
        const detail = e instanceof DomainError ? e.message : String(e);
        void webview.postMessage({ type: 'noteUpdated', success: false, error: detail });
      }
    }
  }

  private postThemeToWebview(webview: vscode.Webview): void {
    void webview.postMessage({ type: 'theme', dark: vscodeThemeIsDark() });
  }

  private postThemeToAllWebviews(): void {
    const msg = { type: 'theme' as const, dark: vscodeThemeIsDark() };
    if (this.panel) {
      void this.panel.webview.postMessage(msg);
    }
    if (this.sidebarWebview) {
      void this.sidebarWebview.postMessage(msg);
    }
  }

  private postActiveFileToSidebar(): void {
    if (!this.sidebarWebview) {
      return;
    }
    const rel = this.getActiveEditorRelativePath();
    void this.sidebarWebview.postMessage({ type: 'activeFile', filePath: rel });
  }

  private getActiveEditorRelativePath(): string | null {
    const ed = vscode.window.activeTextEditor;
    if (!ed || ed.document.uri.scheme !== 'file') {
      return null;
    }
    return vscode.workspace.asRelativePath(ed.document.uri, false);
  }

  private async pushNotes(): Promise<void> {
    const cfg = await this.container.storage.loadConfig();
    const { notes } = await this.container.listNotes.execute({
      sortBy: 'priority',
      sortOrder: 'asc',
    });
    const msg: NotesPanelNotesMessage = {
      type: 'notes',
      payload: notes,
      priorities: cfg.priorities,
      types: cfg.types,
      scopes: cfg.scopes,
      statuses: cfg.statuses,
    };
    if (this.panel) {
      void this.panel.webview.postMessage(msg);
    }
    if (this.sidebarWebview) {
      void this.sidebarWebview.postMessage(msg);
    }
  }

  private getHtml(webview: vscode.Webview, options?: { notesScope?: NotesScopeAttr }): string {
    const scope: NotesScopeAttr = options?.notesScope ?? 'workspace';
    const scopeAttr =
      scope === 'currentFile' ? ' data-notes-scope="current-file"' : ' data-notes-scope="workspace"';
    const bodyPadClass = scope === 'currentFile' ? ' p-0' : '';
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview', 'index.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview', 'main.css')
    );
    const nonce = String(Math.random()).slice(2);
    const csp = [
      `default-src 'none'`,
      `style-src ${webview.cspSource} 'unsafe-inline'`,
      `script-src 'nonce-${nonce}'`,
    ].join('; ');
    const htmlClass = vscodeThemeIsDark() ? 'dark' : '';
    return `<!DOCTYPE html>
<html lang="en" class="${htmlClass}">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <link rel="stylesheet" href="${styleUri}" />
  <title>CodeSentinel</title>
</head>
<body class="flex h-full min-h-0 w-full min-w-0 flex-col bg-background font-sans text-foreground antialiased${bodyPadClass}"${scopeAttr}>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}
