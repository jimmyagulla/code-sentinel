import * as vscode from 'vscode';
import type { NotificationPort } from '../../application/ports/NotificationPort';

export class VscodeNotificationAdapter implements NotificationPort {
  info(message: string): void {
    void vscode.window.showInformationMessage(message);
  }

  warn(message: string): void {
    void vscode.window.showWarningMessage(message);
  }

  error(message: string): void {
    void vscode.window.showErrorMessage(message);
  }
}
