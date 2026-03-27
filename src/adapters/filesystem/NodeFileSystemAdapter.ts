import * as fs from 'fs/promises';
import * as path from 'path';
import type { FileSystemPort } from '../../application/ports/FileSystemPort';

export class NodeFileSystemAdapter implements FileSystemPort {
  joinPaths(...parts: string[]): string {
    return path.join(...parts);
  }

  async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf-8');
  }

  async writeFileAtomic(filePath: string, content: string): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    await fs.writeFile(tempPath, content, 'utf-8');
    await fs.rename(tempPath, filePath);
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async mkdir(dir: string, recursive = true): Promise<void> {
    await fs.mkdir(dir, { recursive });
  }

  async delete(filePath: string): Promise<void> {
    await fs.unlink(filePath);
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    await fs.mkdir(path.dirname(newPath), { recursive: true });
    await fs.rename(oldPath, newPath);
  }

  async listFiles(dir: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const out: string[] = [];
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          const sub = await this.listFiles(full);
          out.push(...sub);
        } else {
          out.push(full);
        }
      }
      return out;
    } catch {
      return [];
    }
  }
}
