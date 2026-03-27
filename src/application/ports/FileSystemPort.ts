export interface FileSystemPort {
  /** Platform-specific path join (e.g. Node `path.join`). */
  joinPaths(...parts: string[]): string;
  readFile(path: string): Promise<string>;
  writeFileAtomic(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string, recursive?: boolean): Promise<void>;
  delete(path: string): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;
  listFiles(dir: string): Promise<string[]>;
}
