import type { VsCodeApi } from '../vscode';
import type { UpdateNoteToHostInput, WebviewToHostMessage } from '../types/webviewHostMessages';

function post(api: VsCodeApi, message: WebviewToHostMessage): void {
  api.postMessage(message);
}

/**
 * Typed actions sent to the extension host from the notes webview.
 */
export const webviewHostService = {
  notifyReady(api: VsCodeApi): void {
    post(api, { type: 'ready' });
  },

  navigateToFile(api: VsCodeApi, filePath: string, line: number): void {
    post(api, { type: 'navigate', filePath, line });
  },

  deleteNote(api: VsCodeApi, noteId: string): void {
    post(api, { type: 'deleteNote', noteId });
  },

  updateNote(api: VsCodeApi, input: UpdateNoteToHostInput): void {
    post(api, { type: 'updateNote', ...input });
  },
};
