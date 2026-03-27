import simpleGit, { SimpleGit } from 'simple-git';
import * as path from 'path';
import type { Author } from '../../domain/value-objects/Author';
import type { CommitHash } from '../../domain/value-objects/CommitHash';
import { toCommitHash } from '../../domain/value-objects/CommitHash';
import type { FilePath } from '../../domain/value-objects/FilePath';
import { toFilePath } from '../../domain/value-objects/FilePath';
import type { RenameMapping, ScmPort } from '../../application/ports/ScmPort';

interface CacheEntry<T> {
  value: T;
  expires: number;
}

function matchesExclude(filePath: string, pattern: string): boolean {
  const norm = filePath.replace(/\\/g, '/');
  const p = pattern.replace(/\\/g, '/');
  if (p.endsWith('/**')) {
    const prefix = p.slice(0, -3);
    return norm === prefix || norm.startsWith(prefix + '/');
  }
  if (p.startsWith('*.')) {
    return norm.endsWith(p.slice(1));
  }
  if (p.includes('*')) {
    const base = path.basename(norm);
    const escaped = p
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\\\*/g, '.*');
    return new RegExp(`^${escaped}$`).test(base);
  }
  return norm === p || norm.endsWith('/' + p);
}

function filterByPatterns(files: string[], excludePatterns: string[]): FilePath[] {
  const out: FilePath[] = [];
  outer: for (const f of files) {
    const fp = f.replace(/\\/g, '/');
    for (const p of excludePatterns) {
      if (matchesExclude(fp, p)) {
        continue outer;
      }
    }
    out.push(toFilePath(fp));
  }
  return out;
}

export class GitAdapter implements ScmPort {
  private readonly git: SimpleGit;
  private currentCommitCache: CacheEntry<CommitHash | null> | null = null;
  private trackedRawCache: CacheEntry<string[]> | null = null;

  constructor(private readonly repoRoot: string) {
    this.git = simpleGit(repoRoot);
  }

  invalidateCaches(): void {
    this.currentCommitCache = null;
    this.trackedRawCache = null;
  }

  async getCurrentCommit(): Promise<CommitHash | null> {
    const now = Date.now();
    if (this.currentCommitCache && this.currentCommitCache.expires > now) {
      return this.currentCommitCache.value;
    }
    try {
      const log = await this.git.log({ maxCount: 1 });
      const sha = log.latest?.hash ?? null;
      const v = sha ? toCommitHash(sha) : null;
      this.currentCommitCache = { value: v, expires: now + 5000 };
      return v;
    } catch {
      this.currentCommitCache = { value: null, expires: now + 5000 };
      return null;
    }
  }

  async getFileLastModifiedCommit(filePath: FilePath): Promise<CommitHash | null> {
    try {
      const rel = String(filePath).replace(/\\/g, '/');
      const log = await this.git.log({ file: rel, maxCount: 1 });
      const sha = log.latest?.hash;
      return sha ? toCommitHash(sha) : null;
    } catch {
      return null;
    }
  }

  async isFileModifiedSince(filePath: FilePath, sinceCommit: CommitHash): Promise<boolean> {
    try {
      const rel = String(filePath).replace(/\\/g, '/');
      const log = await this.git.log({ file: rel, from: sinceCommit });
      return log.total > 0;
    } catch {
      return true;
    }
  }

  async getFileRenames(fromCommit: CommitHash, toCommit: CommitHash): Promise<RenameMapping[]> {
    try {
      const diff = await this.git.raw([
        'diff',
        '--name-status',
        '--find-renames=50',
        `${fromCommit}..${toCommit}`,
      ]);
      const lines = diff.split(/\r?\n/).filter(Boolean);
      const out: RenameMapping[] = [];
      for (const line of lines) {
        const parts = line.split(/\t/);
        if (parts[0]?.startsWith('R')) {
          const oldPath = parts[1];
          const newPath = parts[2];
          if (oldPath && newPath) {
            out.push({
              oldPath: toFilePath(oldPath.replace(/\\/g, '/')),
              newPath: toFilePath(newPath.replace(/\\/g, '/')),
              similarity: 100,
            });
          }
        }
      }
      return out;
    } catch {
      return [];
    }
  }

  async getTrackedFiles(excludePatterns: string[]): Promise<FilePath[]> {
    const now = Date.now();
    let files: string[];
    if (this.trackedRawCache && this.trackedRawCache.expires > now) {
      files = this.trackedRawCache.value;
    } else {
      try {
        const raw = await this.git.raw(['ls-files', '--cached']);
        files = raw.split(/\r?\n/).filter(Boolean).map((f) => f.replace(/\\/g, '/'));
        this.trackedRawCache = { value: files, expires: now + 30000 };
      } catch {
        return [];
      }
    }
    return filterByPatterns(files, excludePatterns);
  }

  async getUserConfig(): Promise<Author> {
    try {
      const name = (await this.git.raw(['config', 'user.name'])).trim() || 'unknown';
      const email = (await this.git.raw(['config', 'user.email'])).trim() || 'unknown@localhost';
      return { name, email };
    } catch {
      return { name: 'unknown', email: 'unknown@localhost' };
    }
  }

  async isShallowClone(): Promise<boolean> {
    try {
      const out = await this.git.raw(['rev-parse', '--is-shallow-repository']);
      return out.trim() === 'true';
    } catch {
      return false;
    }
  }

  async commitExists(commit: CommitHash): Promise<boolean> {
    try {
      await this.git.raw(['cat-file', '-t', commit]);
      return true;
    } catch {
      return false;
    }
  }
}
