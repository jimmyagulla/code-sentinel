import { FileStatusValue } from '../../domain/value-objects/FileStatusValue';
import type { FilePath } from '../../domain/value-objects/FilePath';
import { toCommitHash } from '../../domain/value-objects/CommitHash';
import type { StoragePort } from '../ports/StoragePort';
import type { ScmPort } from '../ports/ScmPort';
import type { FileHealthDto } from '../dtos/FileHealthDto';
import { createEmptyFileNoteData } from '../factories/fileNoteDataFactory';

export interface ValidateFileStatusInput {
  filePath: FilePath;
}

export interface ValidateFileStatusOutput {
  fileHealth: FileHealthDto;
  transitioned: boolean;
}

export class ValidateFileStatusUseCase {
  constructor(
    private readonly storage: StoragePort,
    private readonly scm: ScmPort
  ) {}

  async execute(input: ValidateFileStatusInput): Promise<ValidateFileStatusOutput> {
    const cfg = await this.storage.loadConfig();
    let data = await this.storage.loadNotes(input.filePath);
    if (!data) {
      data = createEmptyFileNoteData(input.filePath, cfg.fileStatusDefaults.defaultStatus);
    }

    let transitioned = false;
    const st = data.fileStatus.status;

    if (st === FileStatusValue.OK && data.fileStatus.lastValidatedCommit) {
      const exists = await this.scm.commitExists(toCommitHash(data.fileStatus.lastValidatedCommit));
      if (!exists) {
        data.fileStatus = {
          ...data.fileStatus,
          status: FileStatusValue.NEEDS_REVIEW,
          lastValidatedCommit: null,
          lastValidatedAt: null,
          validatedBy: null,
        };
        transitioned = true;
      } else {
        const modified = await this.scm.isFileModifiedSince(
          input.filePath,
          toCommitHash(data.fileStatus.lastValidatedCommit)
        );
        if (modified) {
          data.fileStatus = {
            ...data.fileStatus,
            status: FileStatusValue.NEEDS_REVIEW,
            lastValidatedCommit: null,
            lastValidatedAt: null,
            validatedBy: null,
          };
          transitioned = true;
        }
      }
    }

    if (transitioned) {
      await this.storage.saveNotes(input.filePath, data);
    }

    return {
      fileHealth: {
        filePath: String(input.filePath),
        status: data.fileStatus.status,
        lastValidatedCommit: data.fileStatus.lastValidatedCommit,
        lastValidatedAt: data.fileStatus.lastValidatedAt,
        validatedBy: data.fileStatus.validatedBy,
      },
      transitioned,
    };
  }
}
