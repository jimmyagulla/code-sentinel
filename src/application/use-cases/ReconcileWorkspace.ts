import { toCommitHash } from '../../domain/value-objects/CommitHash';
import type { StoragePort } from '../ports/StoragePort';
import type { ScmPort } from '../ports/ScmPort';
import type { FileSystemPort } from '../ports/FileSystemPort';
import type { ConfigPort } from '../ports/ConfigPort';
import type { HashPort } from '../ports/HashPort';
import type { ReconcileFileUseCase } from './ReconcileFile';
import type { ValidateFileStatusUseCase } from './ValidateFileStatus';

export interface ReconcileWorkspaceInput {
  /** optional */
}

export interface ReconcileWorkspaceOutput {
  relocatedNotes: number;
  deletedNotes: number;
  statusTransitions: number;
  orphanedFiles: string[];
}

export class ReconcileWorkspaceUseCase {
  constructor(
    private readonly storage: StoragePort,
    private readonly scm: ScmPort,
    private readonly fs: FileSystemPort,
    private readonly hash: HashPort,
    private readonly configPort: ConfigPort,
    private readonly workspaceRoot: string,
    private readonly reconcileFile: ReconcileFileUseCase,
    private readonly validateFileStatus: ValidateFileStatusUseCase
  ) {}

  async execute(_input: ReconcileWorkspaceInput): Promise<ReconcileWorkspaceOutput> {
    let relocatedNotes = 0;
    let deletedNotes = 0;
    let statusTransitions = 0;
    const orphanedFiles: string[] = [];

    const cfg = await this.storage.loadConfig();
    const head = await this.scm.getCurrentCommit();
    const lastReconcile = cfg.lastReconcileCommit
      ? toCommitHash(cfg.lastReconcileCommit)
      : null;

    if (head && lastReconcile && lastReconcile !== head) {
      const renames = await this.scm.getFileRenames(lastReconcile, head);
      for (const r of renames) {
        await this.storage.relocateNotesForRename(r.oldPath, r.newPath);
        relocatedNotes += 1;
      }
    }

    if (head) {
      cfg.lastReconcileCommit = head;
      await this.storage.saveConfig(cfg);
    }

    const noteFiles = await this.storage.listNoteFiles();
    for (const fp of noteFiles) {
      const abs = this.fs.joinPaths(this.workspaceRoot, String(fp).replace(/\\/g, '/'));
      if (!(await this.fs.exists(abs))) {
        orphanedFiles.push(String(fp));
        const data = await this.storage.loadNotes(fp);
        deletedNotes += data?.notes.length ?? 0;
        await this.storage.deleteNoteFile(fp);
        continue;
      }
      const out = await this.reconcileFile.execute({ filePath: fp });
      deletedNotes += out.deletedNotes;
    }

    const tracked = await this.scm.getTrackedFiles(cfg.fileStatusDefaults.excludePatterns);
    for (const tf of tracked) {
      const res = await this.validateFileStatus.execute({ filePath: tf });
      if (res.transitioned) {
        statusTransitions += 1;
      }
    }

    return {
      relocatedNotes,
      deletedNotes,
      statusTransitions,
      orphanedFiles,
    };
  }
}
