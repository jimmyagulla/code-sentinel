import { type ReactElement } from 'react';
import { useWebviewHostMessageHandler } from '../contexts/WebviewHostMessageProvider';
import { useNotesPanelStore } from '../stores/notesPanelStore';
import type { ActiveFileMessage } from '../types/hostToWebviewMessages';

/**
 * Subscribes to `activeFile` host messages (Explorer “this file” notes view only).
 */
export function CurrentFileScopeSync(): ReactElement | null {
  const setActiveFilePath = useNotesPanelStore((s) => s.setActiveFilePath);

  useWebviewHostMessageHandler('activeFile', (data) => {
    const msg = data as ActiveFileMessage;
    if (msg.type !== 'activeFile') {
      return;
    }
    setActiveFilePath(msg.filePath ?? null);
  });

  return null;
}
