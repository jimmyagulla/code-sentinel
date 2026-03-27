import * as vscode from 'vscode';

/**
 * Surfaces "Add CodeSentinel note" next to other quick fixes for the current selection.
 */
export class SentinelCodeActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    _context: vscode.CodeActionContext,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeAction[]> {
    if (range.isEmpty) return undefined;
    if (document.uri.scheme !== 'file') return undefined;
    const ws = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!ws) return undefined;

    const action = new vscode.CodeAction('Add CodeSentinel note', vscode.CodeActionKind.QuickFix);
    action.command = {
      command: 'codesentinel.createNote',
      title: 'Add CodeSentinel note',
    };
    action.isPreferred = false;
    return [action];
  }
}
