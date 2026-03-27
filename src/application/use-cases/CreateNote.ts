import { DomainError } from '../../domain/errors/DomainErrors';
import { createLineRange } from '../../domain/value-objects/LineRange';
import { createAnchor } from '../../domain/services/LineAnchorService';
import type { FilePath } from '../../domain/value-objects/FilePath';
import type { NoteDto } from '../dtos/NoteDto';
import type { StoragePort } from '../ports/StoragePort';
import type { ScmPort } from '../ports/ScmPort';
import type { FileSystemPort } from '../ports/FileSystemPort';
import type { HashPort } from '../ports/HashPort';
import { createEmptyFileNoteData } from '../factories/fileNoteDataFactory';
import { storedNoteToDto } from '../mappers/noteMappers';
import { defaultInitialNoteStatus } from '../config/defaultNoteStatus';

export interface CreateNoteInput {
  filePath: FilePath;
  lineRange: { startLine: number; endLine: number };
  content: string;
  priority: string;
  type: string;
  scope: string;
}

export interface CreateNoteOutput {
  note: NoteDto;
}

export class CreateNoteUseCase {
  constructor(
    private readonly storage: StoragePort,
    private readonly scm: ScmPort,
    private readonly fs: FileSystemPort,
    private readonly hash: HashPort,
    private readonly workspaceRoot: string
  ) {}

  async execute(input: CreateNoteInput): Promise<CreateNoteOutput> {
    if (!input.content.trim()) {
      throw new DomainError('Note content must not be empty');
    }
    const cfg = await this.storage.loadConfig();
    if (!cfg.types.includes(input.type)) {
      throw new DomainError(`Invalid note type: ${input.type}`);
    }
    if (!cfg.scopes.includes(input.scope)) {
      throw new DomainError(`Invalid note scope: ${input.scope}`);
    }
    if (!cfg.priorities.some((p) => p.name === input.priority)) {
      throw new DomainError(`Invalid priority: ${input.priority}`);
    }
    const noteStatus = defaultInitialNoteStatus(cfg);

    const abs = this.fs.joinPaths(
      this.workspaceRoot,
      String(input.filePath).replace(/\\/g, '/')
    );
    const fileContent = await this.fs.readFile(abs);
    const range = createLineRange(input.lineRange.startLine, input.lineRange.endLine);
    const hasher = (c: string) => this.hash.sha256Hex(c);
    const anchor = createAnchor(fileContent, range, hasher);

    const author = await this.scm.getUserConfig();
    const now = new Date().toISOString();
    const id = this.hash.randomUuid();

    let data = await this.storage.loadNotes(input.filePath);
    if (!data) {
      data = createEmptyFileNoteData(
        input.filePath,
        cfg.fileStatusDefaults.defaultStatus
      );
    }

    data.notes.push({
      id,
      anchor: {
        startLine: anchor.lineRange.startLine,
        endLine: anchor.lineRange.endLine,
        contentHash: anchor.contentHash,
        snippet: anchor.snippet,
      },
      content: input.content.trim(),
      priority: input.priority,
      type: input.type,
      scope: input.scope,
      status: noteStatus,
      author,
      createdAt: now,
      updatedAt: now,
    });

    await this.storage.saveNotes(input.filePath, data);

    const note = storedNoteToDto(
      data.notes[data.notes.length - 1],
      String(input.filePath)
    );
    return { note };
  }
}
