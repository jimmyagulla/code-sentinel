import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { NodeFileSystemAdapter } from '../../../src/adapters/filesystem/NodeFileSystemAdapter';
import { JsonFileStorageAdapter } from '../../../src/adapters/storage/JsonFileStorageAdapter';
import { toFilePath } from '../../../src/domain/value-objects/FilePath';
import { FileStatusValue } from '../../../src/domain/value-objects/FileStatusValue';
import { createEmptyFileNoteData } from '../../../src/application/factories/fileNoteDataFactory';

describe('JsonFileStorageAdapter', () => {
  let tmp: string;
  let adapter: JsonFileStorageAdapter;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'cs-'));
    const fsAdapter = new NodeFileSystemAdapter();
    adapter = new JsonFileStorageAdapter(fsAdapter, tmp, '.codesentinel');
  });

  it('saves and loads notes', async () => {
    const fp = toFilePath('src/a.ts');
    const data = createEmptyFileNoteData(fp, FileStatusValue.NEEDS_REVIEW);
    data.notes.push({
      id: 'n1',
      anchor: { startLine: 1, endLine: 1, contentHash: 'sha256:x', snippet: 'x' },
      content: 'hello',
      priority: 'HIGH',
      type: 'TODO',
      scope: 'PERFORMANCE',
      status: 'OPEN',
      author: { name: 't', email: 't@t' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await adapter.saveNotes(fp, data);
    const loaded = await adapter.loadNotes(fp);
    expect(loaded?.notes.length).toBe(1);
    expect(loaded?.notes[0].content).toBe('hello');
  });
});
