import * as path from 'path';
import type { FileNoteData } from '../../application/dtos/FileNoteData';
import type { StoragePort } from '../../application/ports/StoragePort';
import type { ProjectConfigDto } from '../../application/dtos/ProjectConfigDto';
import type { FileSystemPort } from '../../application/ports/FileSystemPort';
import type { FilePath } from '../../domain/value-objects/FilePath';
import { createDefaultProjectConfig } from '../../application/config/defaultProjectConfig';
import { FILE_NOTE_DATA_VERSION } from '../../constants/fileNoteDataVersion';

function sanitizeRelative(fp: string): string {
  return fp.replace(/\\/g, '/').replace(/^(\.\.\/)+/, '');
}

export class JsonFileStorageAdapter implements StoragePort {
  constructor(
    private readonly fs: FileSystemPort,
    private readonly workspaceRoot: string,
    private readonly storageRelative: string
  ) {}

  getStorageRoot(): string {
    return path.join(this.workspaceRoot, this.storageRelative);
  }

  private configPath(): string {
    return path.join(this.getStorageRoot(), 'config.json');
  }

  private notePathForSourceFile(filePath: FilePath): string {
    const safe = sanitizeRelative(String(filePath));
    return path.join(this.getStorageRoot(), 'notes', safe + '.json');
  }

  async loadConfig(): Promise<ProjectConfigDto> {
    const p = this.configPath();
    if (!(await this.fs.exists(p))) {
      const def = createDefaultProjectConfig();
      await this.saveConfig(def);
      return def;
    }
    try {
      const raw = await this.fs.readFile(p);
      const parsed = JSON.parse(raw) as ProjectConfigDto;
      if (typeof parsed.version !== 'number') {
        return createDefaultProjectConfig();
      }
      return parsed;
    } catch {
      return createDefaultProjectConfig();
    }
  }

  async saveConfig(config: ProjectConfigDto): Promise<void> {
    await this.fs.mkdir(this.getStorageRoot(), true);
    await this.fs.writeFileAtomic(this.configPath(), JSON.stringify(config, null, 2));
  }

  async loadNotes(filePath: FilePath): Promise<FileNoteData | null> {
    const p = this.notePathForSourceFile(filePath);
    if (!(await this.fs.exists(p))) {
      return null;
    }
    try {
      const raw = await this.fs.readFile(p);
      const parsed = JSON.parse(raw) as FileNoteData;
      return parsed;
    } catch {
      return null;
    }
  }

  async saveNotes(filePath: FilePath, data: FileNoteData): Promise<void> {
    const p = this.notePathForSourceFile(filePath);
    data.version = FILE_NOTE_DATA_VERSION;
    await this.fs.writeFileAtomic(p, JSON.stringify(data, null, 2));
  }

  async deleteNoteFile(filePath: FilePath): Promise<void> {
    const p = this.notePathForSourceFile(filePath);
    if (await this.fs.exists(p)) {
      await this.fs.delete(p);
    }
  }

  async relocateNotesForRename(oldPath: FilePath, newPath: FilePath): Promise<void> {
    const oldP = this.notePathForSourceFile(oldPath);
    const newP = this.notePathForSourceFile(newPath);
    if (!(await this.fs.exists(oldP))) {
      return;
    }
    const raw = await this.fs.readFile(oldP);
    const data = JSON.parse(raw) as FileNoteData;
    data.filePath = String(newPath);
    await this.fs.writeFileAtomic(newP, JSON.stringify(data, null, 2));
    await this.fs.delete(oldP);
  }

  async listNoteFiles(): Promise<FilePath[]> {
    const notesDir = path.join(this.getStorageRoot(), 'notes');
    if (!(await this.fs.exists(notesDir))) {
      return [];
    }
    const files = await this.fs.listFiles(notesDir);
    const result: FilePath[] = [];
    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      try {
        const raw = await this.fs.readFile(f);
        const parsed = JSON.parse(raw) as FileNoteData;
        if (parsed.filePath) {
          result.push(parsed.filePath as FilePath);
        } else {
          const rel = path.relative(notesDir, f);
          const without = rel.slice(0, -5).replace(/\\/g, '/');
          result.push(without as FilePath);
        }
      } catch {
        /* skip */
      }
    }
    return result;
  }
}

