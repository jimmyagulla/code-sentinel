import type { Author } from '../../domain/value-objects/Author';
import type { CommitHash } from '../../domain/value-objects/CommitHash';
import type { FilePath } from '../../domain/value-objects/FilePath';

export interface RenameMapping {
  oldPath: FilePath;
  newPath: FilePath;
  similarity: number;
}

export interface ScmPort {
  getCurrentCommit(): Promise<CommitHash | null>;
  getFileLastModifiedCommit(filePath: FilePath): Promise<CommitHash | null>;
  isFileModifiedSince(filePath: FilePath, sinceCommit: CommitHash): Promise<boolean>;
  getFileRenames(fromCommit: CommitHash, toCommit: CommitHash): Promise<RenameMapping[]>;
  getTrackedFiles(excludePatterns: string[]): Promise<FilePath[]>;
  getUserConfig(): Promise<Author>;
  isShallowClone(): Promise<boolean>;
  commitExists(commit: CommitHash): Promise<boolean>;
}
