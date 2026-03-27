import type { FileStatusValue } from '../../domain/value-objects/FileStatusValue';

export interface FileHealthDto {
  filePath: string;
  status: FileStatusValue;
  lastValidatedCommit: string | null;
  lastValidatedAt: string | null;
  validatedBy: { name: string; email: string } | null;
}
