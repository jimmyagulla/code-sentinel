import * as vscode from 'vscode';
import type { Container } from '../../infrastructure/di/Container';
import { FileStatusValue } from '../../domain/value-objects/FileStatusValue';
import { toFilePath } from '../../domain/value-objects/FilePath';

/**
 * Explorer / tab decorations for persisted CodeSentinel file health (OK / NEEDS_REVIEW / KO).
 * Uses a short badge + theme color; tooltip carries the full label.
 */
export class FileStatusDecorationProvider implements vscode.FileDecorationProvider {
  private readonly cache = new Map<string, FileStatusValue>();
  private readonly emitter = new vscode.EventEmitter<undefined | vscode.Uri | vscode.Uri[]>();
  readonly onDidChangeFileDecorations = this.emitter.event;

  constructor(
    private readonly container: Container,
    private readonly workspaceFolder: vscode.WorkspaceFolder
  ) {}

  async refresh(): Promise<void> {
    const { entries } = await this.container.listWorkspaceFileStatuses.execute();
    this.cache.clear();
    for (const { filePath, status } of entries) {
      this.cache.set(String(filePath), status);
    }
    this.emitter.fire(undefined);
  }

  /** Resolve status for the active editor / tabs (same cache as decorations). */
  statusForFileUri(uri: vscode.Uri): FileStatusValue | undefined {
    if (uri.scheme !== 'file') return undefined;
    const rel = vscode.workspace.asRelativePath(uri, false);
    if (!rel || rel.startsWith('..')) return undefined;
    const ws = vscode.workspace.getWorkspaceFolder(uri);
    if (!ws || ws.uri.fsPath !== this.workspaceFolder.uri.fsPath) return undefined;
    return this.cache.get(String(toFilePath(rel)));
  }

  provideFileDecoration(uri: vscode.Uri, _token: vscode.CancellationToken): vscode.FileDecoration | undefined {
    const status = this.statusForFileUri(uri);
    if (status === undefined) return undefined;
    const { badge, tooltip, colorId } = this.styleFor(status);
    return new vscode.FileDecoration(badge, tooltip, new vscode.ThemeColor(colorId));
  }

  private styleFor(status: FileStatusValue): { badge?: string; tooltip: string; colorId: string } {
    switch (status) {
      case FileStatusValue.OK:
        return { badge: '✓', tooltip: 'CodeSentinel: OK', colorId: 'charts.green' };
      case FileStatusValue.NEEDS_REVIEW:
        return { badge: '·', tooltip: 'CodeSentinel: Needs review', colorId: 'charts.orange' };
      case FileStatusValue.KO:
        return { badge: '✕', tooltip: 'CodeSentinel: KO', colorId: 'charts.red' };
    }
  }
}
