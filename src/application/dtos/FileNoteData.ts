import type { FileStatusValue } from '../../domain/value-objects/FileStatusValue';

/** Shape of a note as persisted in `.codesentinel/notes/*.json`. */
export interface StoredNote {
  id: string;
  anchor: {
    startLine: number;
    endLine: number;
    contentHash: string;
    snippet: string;
  };
  content: string;
  priority: string;
  type: string;
  scope: string;
  status: string;
  author: { name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface StoredFileStatus {
  status: FileStatusValue;
  lastValidatedCommit: string | null;
  lastValidatedAt: string | null;
  validatedBy: { name: string; email: string } | null;
}

/** Root document for one source file's notes + file health metadata. */
export interface FileNoteData {
  version: number;
  filePath: string;
  fileStatus: StoredFileStatus;
  notes: StoredNote[];
}
