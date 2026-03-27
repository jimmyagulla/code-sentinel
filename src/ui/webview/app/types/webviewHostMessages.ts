/**
 * Webview → extension host payloads (`postMessage`).
 * Keep in sync with `WebviewMessage` in `src/ui/webview/WebviewProvider.ts`.
 */
export type WebviewToHostMessage =
  | { type: 'ready' }
  | { type: 'navigate'; filePath: string; line: number }
  | { type: 'deleteNote'; noteId: string }
  | {
      type: 'updateNote';
      noteId: string;
      content: string;
      priority: string;
      noteType: string;
      scope: string;
      status: string;
    };

export type UpdateNoteToHostInput = Omit<
  Extract<WebviewToHostMessage, { type: 'updateNote' }>,
  'type'
>;
