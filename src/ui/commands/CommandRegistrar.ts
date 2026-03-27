import * as vscode from 'vscode';
import type { Container } from '../../infrastructure/di/Container';
import { toFilePath } from '../../domain/value-objects/FilePath';
import { FileStatusValue } from '../../domain/value-objects/FileStatusValue';
import { DomainError } from '../../domain/errors/DomainErrors';
import { logger } from '../../infrastructure/logging/Logger';
import type { NotesWebviewController } from '../webview/WebviewProvider';
import { DEFAULT_STORAGE_RELATIVE_PATH } from '../../constants/defaultStoragePath';

export function registerCommands(
  context: vscode.ExtensionContext,
  container: Container,
  notesWebview: NotesWebviewController,
  onDecorationRefresh: () => void
): void {
  const subs: vscode.Disposable[] = [];

  subs.push(
    vscode.commands.registerCommand('codesentinel.initialize', async () => {
      const storagePath =
        container.configPort.get<string>('storagePath') ?? DEFAULT_STORAGE_RELATIVE_PATH;
      const choice = await vscode.window.showQuickPick(
        [
          {
            label: `$(repo) Commit ${storagePath} to Git (team-shared)`,
            description: 'Track notes and config in version control',
            value: 'commit' as const,
          },
          {
            label: `$(lock) Add ${storagePath} to .gitignore (personal)`,
            description: 'Keep notes local to this machine',
            value: 'ignore' as const,
          },
        ],
        { placeHolder: 'How should CodeSentinel store data?' }
      );
      if (!choice) {
        return;
      }
      await container.setupWorkspace.execute({
        mode: choice.value,
        workspaceRoot: container.workspaceRoot,
        storageRelative: storagePath,
      });
    })
  );

  subs.push(
    vscode.commands.registerCommand('codesentinel.createNote', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('Open a file to create a note');
        return;
      }
      const doc = editor.document;
      if (doc.uri.scheme !== 'file') {
        vscode.window.showWarningMessage('Notes can only be created on file documents');
        return;
      }
      const ws = vscode.workspace.getWorkspaceFolder(doc.uri);
      if (!ws || ws.uri.fsPath !== container.workspaceRoot) {
        vscode.window.showWarningMessage('File must be in the workspace root');
        return;
      }
      const rel = vscode.workspace.asRelativePath(doc.uri, false);
      const selection = editor.selection;
      const startLine = selection.start.line + 1;
      const endLine = selection.end.line + 1;
      const content = await vscode.window.showInputBox({
        prompt: 'Note content',
        placeHolder: 'Describe the issue or improvement',
      });
      if (!content?.trim()) {
        return;
      }
      const cfg = await container.storage.loadConfig();
      const priority = await vscode.window.showQuickPick(
        cfg.priorities.map((p) => p.name),
        { placeHolder: 'Priority' }
      );
      if (!priority) return;
      const type = await vscode.window.showQuickPick(cfg.types, { placeHolder: 'Type' });
      if (!type) return;
      const scope = await vscode.window.showQuickPick(cfg.scopes, { placeHolder: 'Scope' });
      if (!scope) return;
      try {
        await container.createNote.execute({
          filePath: toFilePath(rel),
          lineRange: { startLine, endLine },
          content,
          priority,
          type,
          scope,
        });
        vscode.window.showInformationMessage('Note created');
        notesWebview.refresh();
        onDecorationRefresh();
      } catch (e) {
        const msg = e instanceof DomainError ? e.message : String(e);
        vscode.window.showErrorMessage(msg);
        logger.log(`createNote error: ${msg}`);
      }
    })
  );

  subs.push(
    vscode.commands.registerCommand('codesentinel.deleteNote', async () => {
      const id = await vscode.window.showInputBox({ prompt: 'Note ID to delete' });
      if (!id) return;
      const res = await container.deleteNote.execute({ noteId: id as never });
      if (res.success) {
        vscode.window.showInformationMessage('Note deleted');
        notesWebview.refresh();
        onDecorationRefresh();
      } else {
        vscode.window.showWarningMessage('Note not found');
      }
    })
  );

  async function markStatus(status: FileStatusValue): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.uri.scheme !== 'file') {
      vscode.window.showWarningMessage('Open a file in the workspace');
      return;
    }
    const rel = vscode.workspace.asRelativePath(editor.document.uri, false);
    try {
      await container.markFileStatus.execute({
        filePath: toFilePath(rel),
        status,
      });
      notesWebview.refresh();
      onDecorationRefresh();
    } catch (e) {
      const msg = e instanceof DomainError ? e.message : String(e);
      vscode.window.showErrorMessage(msg);
    }
  }

  subs.push(
    vscode.commands.registerCommand('codesentinel.pickFileStatus', async () => {
      const picked = await vscode.window.showQuickPick(
        [
          { label: '$(check) OK', description: 'Mark file as reviewed / healthy', value: FileStatusValue.OK },
          {
            label: '$(eye) Needs review',
            description: 'Needs another pass',
            value: FileStatusValue.NEEDS_REVIEW,
          },
          { label: '$(error) KO', description: 'Blocked or must fix', value: FileStatusValue.KO },
        ],
        { placeHolder: 'File status for the active file' }
      );
      if (!picked) return;
      await markStatus(picked.value);
    })
  );

  subs.push(
    vscode.commands.registerCommand('codesentinel.markFileOk', () =>
      markStatus(FileStatusValue.OK)
    )
  );
  subs.push(
    vscode.commands.registerCommand('codesentinel.markFileKo', () =>
      markStatus(FileStatusValue.KO)
    )
  );
  subs.push(
    vscode.commands.registerCommand('codesentinel.markFileNeedsReview', () =>
      markStatus(FileStatusValue.NEEDS_REVIEW)
    )
  );

  subs.push(
    vscode.commands.registerCommand('codesentinel.refresh', async () => {
      try {
        const out = await container.reconcileWorkspace.execute({});
        logger.log(
          `Reconcile: relocated=${out.relocatedNotes} deleted=${out.deletedNotes} transitions=${out.statusTransitions}`
        );
        notesWebview.refresh();
        onDecorationRefresh();
      } catch (e) {
        logger.log(`refresh error: ${String(e)}`);
      }
    })
  );

  subs.push(
    vscode.commands.registerCommand('codesentinel.decorations.refresh', () => {
      onDecorationRefresh();
    })
  );

  subs.push(
    vscode.commands.registerCommand('codesentinel.openPanel', () => {
      notesWebview.open();
    })
  );

  context.subscriptions.push(...subs);
}
