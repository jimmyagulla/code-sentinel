/**
 * Extension host → webview (`postMessage`), beyond `notesPanelMessage.ts`.
 */
export type ActiveFileMessage = {
  type: 'activeFile';
  /** Workspace-relative path of the active editor, or null if none / non-file. */
  filePath: string | null;
};
