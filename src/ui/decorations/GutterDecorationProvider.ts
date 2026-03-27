import * as vscode from 'vscode';
import type { Container } from '../../infrastructure/di/Container';
import type { ProjectConfigDto } from '../../application/dtos/ProjectConfigDto';
import { logger } from '../../infrastructure/logging/Logger';

function fallbackPriorityName(cfg: ProjectConfigDto): string {
  const sorted = [...cfg.priorities].sort((a, b) => a.ordinal - b.ordinal);
  const mid = sorted[Math.floor(sorted.length / 2)];
  return mid?.name ?? '';
}

export class GutterDecorationProvider {
  private readonly decorationTypes = new Map<string, vscode.TextEditorDecorationType>();
  private configLoaded = false;

  constructor(private readonly container: Container) {}

  dispose(): void {
    for (const d of this.decorationTypes.values()) {
      d.dispose();
    }
  }

  private async ensureDecorationTypes(cfg: ProjectConfigDto): Promise<void> {
    if (this.configLoaded) {
      return;
    }
    for (const p of cfg.priorities) {
      this.decorationTypes.set(
        p.name,
        vscode.window.createTextEditorDecorationType({
          overviewRulerColor: p.color,
          overviewRulerLane: vscode.OverviewRulerLane.Left,
        })
      );
    }
    this.configLoaded = true;
  }

  async refreshVisibleEditors(): Promise<void> {
    try {
      const cfg = await this.container.storage.loadConfig();
      await this.ensureDecorationTypes(cfg);
      const knownNames = new Set(cfg.priorities.map((p) => p.name));
      const resolvePriority = (name: string): string =>
        knownNames.has(name) ? name : fallbackPriorityName(cfg);

      const { notes } = await this.container.listNotes.execute({});
      const byFile = new Map<string, typeof notes>();
      for (const n of notes) {
        const list = byFile.get(n.filePath) ?? [];
        list.push(n);
        byFile.set(n.filePath, list);
      }

      for (const editor of vscode.window.visibleTextEditors) {
        if (editor.document.uri.scheme !== 'file') continue;
        const rel = vscode.workspace.asRelativePath(editor.document.uri, false);
        const fileNotes = byFile.get(rel) ?? [];
        const byPriority = new Map<string, vscode.Range[]>();
        for (const n of fileNotes) {
          const start = n.anchor.startLine - 1;
          const end = n.anchor.endLine - 1;
          const range = new vscode.Range(start, 0, end, 0);
          const prio = resolvePriority(n.priority);
          const arr = byPriority.get(prio) ?? [];
          arr.push(range);
          byPriority.set(prio, arr);
        }
        for (const [prio, dType] of this.decorationTypes) {
          const ranges = byPriority.get(prio) ?? [];
          editor.setDecorations(dType, ranges);
        }
      }
    } catch (e) {
      logger.log(`gutter refresh error: ${String(e)}`);
    }
  }
}
