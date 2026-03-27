import type { FilePath } from '../../domain/value-objects/FilePath';
import type { FileNoteData } from '../dtos/FileNoteData';
import type { ProjectConfigDto } from '../dtos/ProjectConfigDto';

export interface StoragePort {
  loadNotes(filePath: FilePath): Promise<FileNoteData | null>;
  saveNotes(filePath: FilePath, data: FileNoteData): Promise<void>;
  deleteNoteFile(filePath: FilePath): Promise<void>;
  relocateNotesForRename(oldPath: FilePath, newPath: FilePath): Promise<void>;
  listNoteFiles(): Promise<FilePath[]>;
  loadConfig(): Promise<ProjectConfigDto>;
  saveConfig(config: ProjectConfigDto): Promise<void>;
  getStorageRoot(): string;
}
