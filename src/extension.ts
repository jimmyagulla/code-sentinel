import * as vscode from 'vscode';
import { Container } from './infrastructure/di/Container';
import { GutterDecorationProvider } from './ui/decorations/GutterDecorationProvider';
import { FileStatusDecorationProvider } from './ui/decorations/FileStatusDecorationProvider';
import { SentinelHoverProvider } from './ui/hover/SentinelHoverProvider';
import { SentinelCodeActionProvider } from './ui/codeActions/SentinelCodeActionProvider';
import { SelectionAddNoteCodeLensProvider } from './ui/codeLens/SelectionAddNoteCodeLensProvider';
import { NotesWebviewPanelController } from './ui/webview/WebviewProvider';
import { registerCommands } from './ui/commands/CommandRegistrar';
import { registerSelectionNoteStatusBar } from './ui/status/SelectionNoteStatusBar';
import { registerFileHealthStatusBar } from './ui/status/FileHealthStatusBar';
import { toFilePath } from './domain/value-objects/FilePath';
import { logger } from './infrastructure/logging/Logger';
import { FILE_SCHEME_DOCUMENT_FILTER } from './extensionConstants';

export function activate(context: vscode.ExtensionContext): void {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    void vscode.window.showWarningMessage('CodeSentinel requires a workspace folder.');
    return;
  }

  const container = new Container(folder.uri.fsPath);
  const decorations = new GutterDecorationProvider(container);
  const fileStatusDecorations = new FileStatusDecorationProvider(container, folder);

  const refreshWorkspaceUi = (): void => {
    void decorations.refreshVisibleEditors();
    void fileStatusDecorations.refresh();
  };

  const notesWebview = new NotesWebviewPanelController(context, container, refreshWorkspaceUi);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      NotesWebviewPanelController.currentFileNotesViewId,
      notesWebview
    )
  );

  registerCommands(context, container, notesWebview, refreshWorkspaceUi);

  context.subscriptions.push(
    vscode.window.registerFileDecorationProvider(fileStatusDecorations),
    vscode.languages.registerCodeActionsProvider(
      FILE_SCHEME_DOCUMENT_FILTER,
      new SentinelCodeActionProvider(),
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    ),
    vscode.languages.registerCodeLensProvider(
      FILE_SCHEME_DOCUMENT_FILTER,
      new SelectionAddNoteCodeLensProvider()
    ),
    vscode.languages.registerHoverProvider(
      FILE_SCHEME_DOCUMENT_FILTER,
      new SentinelHoverProvider(container)
    ),
    vscode.workspace.onDidSaveTextDocument(async (doc) => {
      if (doc.uri.scheme !== 'file') return;
      const rel = vscode.workspace.asRelativePath(doc.uri, false);
      try {
        await container.reconcileFile.execute({ filePath: toFilePath(rel) });
        refreshWorkspaceUi();
      } catch (e) {
        logger.log(`reconcileFile on save: ${String(e)}`);
      }
    }),
    vscode.window.onDidChangeVisibleTextEditors(() => {
      void decorations.refreshVisibleEditors();
    }),
    { dispose: () => decorations.dispose() }
  );

  void vscode.commands.executeCommand('setContext', 'codesentinel.enabled', true);
  registerSelectionNoteStatusBar(context);
  registerFileHealthStatusBar(context, fileStatusDecorations);
  void fileStatusDecorations.refresh();

  const auto = container.configPort.get<boolean>('autoReconcileOnOpen') ?? true;
  if (auto) {
    void container.reconcileWorkspace
      .execute({})
      .then(() => refreshWorkspaceUi())
      .catch((e) => logger.log(`reconcileWorkspace: ${String(e)}`));
  } else {
    refreshWorkspaceUi();
  }
}

export function deactivate(): void {}
