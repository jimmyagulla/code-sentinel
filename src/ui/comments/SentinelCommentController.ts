import * as vscode from 'vscode';

/**
 * Placeholder for future native Comment API integration (map `Note` ↔ `CommentThread`).
 * MVP uses commands + decorations + webview instead.
 */
export class SentinelCommentController implements vscode.Disposable {
  private readonly controller: vscode.CommentController;

  constructor() {
    this.controller = vscode.comments.createCommentController('codesentinel', 'CodeSentinel');
  }

  dispose(): void {
    this.controller.dispose();
  }
}
