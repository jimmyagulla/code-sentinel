import type { Author } from '../value-objects/Author';
import type { CommitHash } from '../value-objects/CommitHash';
import type { FilePath } from '../value-objects/FilePath';
import { FileStatusValue } from '../value-objects/FileStatusValue';

export interface FileHealth {
  readonly filePath: FilePath;
  status: FileStatusValue;
  lastValidatedCommit: CommitHash | null;
  lastValidatedAt: Date | null;
  validatedBy: Author | null;
}
