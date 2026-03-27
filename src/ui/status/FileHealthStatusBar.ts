import * as vscode from 'vscode';
import { FileStatusValue } from '../../domain/value-objects/FileStatusValue';
import type { FileStatusDecorationProvider } from '../decorations/FileStatusDecorationProvider';

/**
 * Compact status line for the active file (complements explorer/tab decorations).
 */
export function registerFileHealthStatusBar(
  context: vscode.ExtensionContext,
  provider: FileStatusDecorationProvider
): void {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  item.command = 'codesentinel.pickFileStatus';

  const sync = (): void => {
    const ed = vscode.window.activeTextEditor;
    if (!ed || ed.document.uri.scheme !== 'file') {
      item.hide();
      return;
    }
    const st = provider.statusForFileUri(ed.document.uri);
    if (st === undefined) {
      item.hide();
      return;
    }
    item.text = label(st);
    item.tooltip = 'CodeSentinel file status — click to change';
    item.show();
  };

  sync();
  context.subscriptions.push(
    item,
    vscode.window.onDidChangeActiveTextEditor(() => sync()),
    provider.onDidChangeFileDecorations(() => sync())
  );
}

function label(status: FileStatusValue): string {
  switch (status) {
    case FileStatusValue.OK:
      return '$(check) CS OK';
    case FileStatusValue.NEEDS_REVIEW:
      return '$(eye) CS Review';
    case FileStatusValue.KO:
      return '$(error) CS KO';
    default:
      return 'CS';
  }
}
