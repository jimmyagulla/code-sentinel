import * as vscode from 'vscode';

const channel = vscode.window.createOutputChannel('CodeSentinel');

export const logger = {
  log(message: string): void {
    channel.appendLine(`[${new Date().toISOString()}] ${message}`);
  },
  show(): void {
    channel.show();
  },
};
