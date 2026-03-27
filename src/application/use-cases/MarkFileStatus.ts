import { DomainError } from '../../domain/errors/DomainErrors';
import { FileStatusValue } from '../../domain/value-objects/FileStatusValue';
import type { FilePath } from '../../domain/value-objects/FilePath';
import type { StoragePort } from '../ports/StoragePort';
import type { ScmPort } from '../ports/ScmPort';
import type { FileHealthDto } from '../dtos/FileHealthDto';
import { createEmptyFileNoteData } from '../factories/fileNoteDataFactory';

export interface MarkFileStatusInput {
  filePath: FilePath;
  status: FileStatusValue;
}

export interface MarkFileStatusOutput {
  fileHealth: FileHealthDto;
}

export class MarkFileStatusUseCase {
  constructor(
    private readonly storage: StoragePort,
    private readonly scm: ScmPort
  ) {}

  async execute(input: MarkFileStatusInput): Promise<MarkFileStatusOutput> {
    const cfg = await this.storage.loadConfig();
    let data = await this.storage.loadNotes(input.filePath);
    if (!data) {
      data = createEmptyFileNoteData(input.filePath, cfg.fileStatusDefaults.defaultStatus);
    }

    const author = await this.scm.getUserConfig();
    const now = new Date().toISOString();
    const head = await this.scm.getCurrentCommit();

    if (input.status === FileStatusValue.OK) {
      if (!head) {
        throw new DomainError('Cannot mark OK without a Git commit');
      }
      data.fileStatus = {
        status: FileStatusValue.OK,
        lastValidatedCommit: head,
        lastValidatedAt: now,
        validatedBy: author,
      };
    } else {
      data.fileStatus = {
        status: input.status,
        lastValidatedCommit: data.fileStatus.lastValidatedCommit,
        lastValidatedAt: data.fileStatus.lastValidatedAt,
        validatedBy: data.fileStatus.validatedBy,
      };
      if (input.status === FileStatusValue.NEEDS_REVIEW || input.status === FileStatusValue.KO) {
        data.fileStatus.lastValidatedCommit = null;
        data.fileStatus.lastValidatedAt = null;
        data.fileStatus.validatedBy = null;
      }
    }

    await this.storage.saveNotes(input.filePath, data);

    return {
      fileHealth: {
        filePath: String(input.filePath),
        status: data.fileStatus.status,
        lastValidatedCommit: data.fileStatus.lastValidatedCommit,
        lastValidatedAt: data.fileStatus.lastValidatedAt,
        validatedBy: data.fileStatus.validatedBy,
      },
    };
  }
}
