import * as vscode from 'vscode';

/**
 * Shows an inline CodeLens on the first line of a non-empty selection as a reliable
 * CTA (VS Code does not expose the Copilot/inline-chat floating affordance to extensions).
 */
export class SelectionAddNoteCodeLensProvider implements vscode.CodeLensProvider {
  private readonly emitter = new vscode.EventEmitter<void>();
  readonly onDidChangeCodeLenses = this.emitter.event;

  constructor() {
    vscode.window.onDidChangeTextEditorSelection(() => this.emitter.fire());
    vscode.window.onDidChangeActiveTextEditor(() => this.emitter.fire());
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('codesentinel.showSelectionCodeLens')) {
        this.emitter.fire();
      }
    });
  }

  provideCodeLenses(document: vscode.TextDocument): vscode.ProviderResult<vscode.CodeLens[]> {
    const cfg = vscode.workspace.getConfiguration('codesentinel');
    if (!cfg.get<boolean>('showSelectionCodeLens', true)) {
      return [];
    }
    const ed = vscode.window.activeTextEditor;
    if (!ed || ed.document !== document) {
      return [];
    }
    if (ed.selection.isEmpty) {
      return [];
    }
    const startLine = Math.min(ed.selection.start.line, ed.selection.end.line);
    const lineRange = document.lineAt(startLine).range;
    return [
      new vscode.CodeLens(lineRange, {
        title: '$(comment-discussion) Add CodeSentinel note',
        tooltip: 'Create a note for the current selection',
        command: 'codesentinel.createNote',
      }),
    ];
  }
}
