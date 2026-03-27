import type { FileNoteData } from '../dtos/FileNoteData';
import type { FilePath } from '../../domain/value-objects/FilePath';
import { FileStatusValue } from '../../domain/value-objects/FileStatusValue';
import { FILE_NOTE_DATA_VERSION } from '../../constants/fileNoteDataVersion';

export function createEmptyFileNoteData(
  filePath: FilePath,
  defaultStatus: FileStatusValue
): FileNoteData {
  return {
    version: FILE_NOTE_DATA_VERSION,
    filePath: String(filePath),
    fileStatus: {
      status: defaultStatus,
      lastValidatedCommit: null,
      lastValidatedAt: null,
      validatedBy: null,
    },
    notes: [],
  };
}
