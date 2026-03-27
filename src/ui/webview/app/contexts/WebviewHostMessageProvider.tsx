import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useVscodeApi } from './VscodeApiProvider';
import { webviewHostService } from '../services/webviewHostService';

type HostMessageHandler = (data: unknown) => void;

type WebviewHostMessageContextValue = {
  register: (messageType: string, handler: HostMessageHandler) => () => void;
};

const WebviewHostMessageContext = createContext<WebviewHostMessageContextValue | null>(null);

/**
 * Single `window` message listener; routes `event.data.type` to registered handlers.
 * Also posts `{ type: 'ready' }` once on mount.
 */
export function WebviewHostMessageProvider(props: { children: ReactNode }): ReactElement {
  const { children } = props;
  const vscode = useVscodeApi();
  const registryRef = useRef<Map<string, Set<HostMessageHandler>>>(new Map());

  const register = useCallback((messageType: string, handler: HostMessageHandler) => {
    let set = registryRef.current.get(messageType);
    if (!set) {
      set = new Set();
      registryRef.current.set(messageType, set);
    }
    set.add(handler);
    return () => {
      set.delete(handler);
      if (set.size === 0) {
        registryRef.current.delete(messageType);
      }
    };
  }, []);

  useEffect(() => {
    webviewHostService.notifyReady(vscode);
  }, [vscode]);

  useEffect(() => {
    const onMessage = (event: MessageEvent): void => {
      const data = event.data;
      if (typeof data !== 'object' || data === null || !('type' in data)) {
        return;
      }
      const t = (data as { type: unknown }).type;
      if (typeof t !== 'string') {
        return;
      }
      const handlers = registryRef.current.get(t);
      if (!handlers) {
        return;
      }
      handlers.forEach((h) => {
        h(data);
      });
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const value = useMemo(() => ({ register }), [register]);

  return (
    <WebviewHostMessageContext.Provider value={value}>{children}</WebviewHostMessageContext.Provider>
  );
}

/**
 * Subscribe to extension host → webview messages of a given `type`.
 * Handler receives the full `event.data` object.
 */
export function useWebviewHostMessageHandler(
  messageType: string,
  handler: HostMessageHandler
): void {
  const ctx = useContext(WebviewHostMessageContext);
  if (ctx === null) {
    throw new Error('useWebviewHostMessageHandler must be used within WebviewHostMessageProvider');
  }
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    return ctx.register(messageType, (data) => handlerRef.current(data));
  }, [messageType, ctx]);
}
