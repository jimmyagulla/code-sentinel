import * as vscode from 'vscode';
import type { Container } from '../../infrastructure/di/Container';
import { toFilePath } from '../../domain/value-objects/FilePath';

export class SentinelHoverProvider implements vscode.HoverProvider {
  constructor(private readonly container: Container) {}

  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.Hover | undefined> {
    if (document.uri.scheme !== 'file') {
      return undefined;
    }
    const line = position.line + 1;
    const rel = vscode.workspace.asRelativePath(document.uri, false);
    const { notes } = await this.container.listNotes.execute({
      filters: { filePath: toFilePath(rel) },
    });
    const matches = notes.filter(
      (n) => line >= n.anchor.startLine && line <= n.anchor.endLine
    );
    if (matches.length === 0) {
      return undefined;
    }
    const parts: string[] = [];
    for (const n of matches) {
      parts.push(
        `**[${n.priority}]** ${n.type} · ${n.scope} · _${n.status}_\n\n${n.content}\n\n_${n.author.name} · ${n.createdAt}_`
      );
    }
    const md = new vscode.MarkdownString(parts.join('\n\n---\n\n'));
    md.isTrusted = true;
    return new vscode.Hover(md);
  }
}
