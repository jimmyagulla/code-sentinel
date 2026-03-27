import { resolveAnchor } from '../../domain/services/LineAnchorService';
import type { FilePath } from '../../domain/value-objects/FilePath';
import type { StoragePort } from '../ports/StoragePort';
import type { ScmPort } from '../ports/ScmPort';
import type { FileSystemPort } from '../ports/FileSystemPort';
import type { ConfigPort } from '../ports/ConfigPort';
import type { HashPort } from '../ports/HashPort';
import { ValidateFileStatusUseCase } from './ValidateFileStatus';

export interface ReconcileFileInput {
  filePath: FilePath;
}

export interface ReconcileFileOutput {
  deletedNotes: number;
  updatedAnchors: number;
}

export class ReconcileFileUseCase {
  constructor(
    private readonly storage: StoragePort,
    private readonly scm: ScmPort,
    private readonly fs: FileSystemPort,
    private readonly hash: HashPort,
    private readonly configPort: ConfigPort,
    private readonly workspaceRoot: string,
    private readonly validateStatus: ValidateFileStatusUseCase
  ) {}

  async execute(input: ReconcileFileInput): Promise<ReconcileFileOutput> {
    let deletedNotes = 0;
    let updatedAnchors = 0;

    const data = await this.storage.loadNotes(input.filePath);
    if (!data || data.notes.length === 0) {
      await this.validateStatus.execute({ filePath: input.filePath });
      return { deletedNotes: 0, updatedAnchors: 0 };
    }

    const abs = this.fs.joinPaths(
      this.workspaceRoot,
      String(input.filePath).replace(/\\/g, '/')
    );
    if (!(await this.fs.exists(abs))) {
      await this.storage.deleteNoteFile(input.filePath);
      return { deletedNotes: data.notes.length, updatedAnchors: 0 };
    }

    const fileContent = await this.fs.readFile(abs);
    const radius = this.configPort.get<number>('anchorSearchRadius') ?? 30;
    const fuzzy = this.configPort.get<number>('anchorFuzzyThreshold') ?? 0.3;
    const hasher = (c: string) => this.hash.sha256Hex(c);

    const kept = [];
    for (const n of data.notes) {
      const anchor = {
        lineRange: { startLine: n.anchor.startLine, endLine: n.anchor.endLine },
        contentHash: n.anchor.contentHash,
        snippet: n.anchor.snippet,
      };
      const res = resolveAnchor(fileContent, anchor, hasher, {
        searchRadius: radius,
        fuzzyThreshold: fuzzy,
      });
      if (res.status === 'lost') {
        deletedNotes += 1;
        continue;
      }
      if (res.status === 'drifted') {
        updatedAnchors += 1;
        n.anchor = {
          startLine: res.lineRange.startLine,
          endLine: res.lineRange.endLine,
          contentHash: res.newHash,
          snippet: res.newSnippet,
        };
      }
      kept.push(n);
    }
    data.notes = kept;

    if (data.notes.length === 0 && !data.fileStatus.lastValidatedCommit) {
      await this.storage.deleteNoteFile(input.filePath);
    } else {
      await this.storage.saveNotes(input.filePath, data);
    }

    await this.validateStatus.execute({ filePath: input.filePath });

    return { deletedNotes, updatedAnchors };
  }
}
