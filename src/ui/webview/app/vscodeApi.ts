import type { VsCodeApi } from './vscode';

/**
 * Wraps the VS Code webview host global `acquireVsCodeApi` (injected at runtime).
 */
export function acquireVsCodeApi(): VsCodeApi {
  const g = globalThis as unknown as { acquireVsCodeApi?: () => VsCodeApi };
  if (typeof g.acquireVsCodeApi !== 'function') {
    throw new Error('acquireVsCodeApi is only available inside a VS Code webview');
  }
  return g.acquireVsCodeApi();
}
