import * as vscode from 'vscode';

/**
 * Shows a status bar button when the user has a non-empty selection in a file editor,
 * as a click target for creating a note (alternative to keyboard shortcut / title bar).
 */
export function registerSelectionNoteStatusBar(context: vscode.ExtensionContext): void {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
  item.command = 'codesentinel.createNote';
  item.text = '$(bookmark) CodeSentinel note';
  item.tooltip = 'Add a CodeSentinel note for the current selection';

  const sync = (): void => {
    const ed = vscode.window.activeTextEditor;
    if (!ed || ed.document.uri.scheme !== 'file') {
      item.hide();
      return;
    }
    if (ed.selection.isEmpty) {
      item.hide();
      return;
    }
    item.show();
  };

  sync();
  context.subscriptions.push(
    item,
    vscode.window.onDidChangeTextEditorSelection(sync),
    vscode.window.onDidChangeActiveTextEditor(sync)
  );
}
