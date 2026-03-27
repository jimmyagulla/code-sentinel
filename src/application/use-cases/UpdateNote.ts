import { DomainError } from '../../domain/errors/DomainErrors';
import type { NoteId } from '../../domain/value-objects/NoteId';
import type { StoragePort } from '../ports/StoragePort';
import type { NoteDto } from '../dtos/NoteDto';
import { storedNoteToDto } from '../mappers/noteMappers';

export interface UpdateNoteInput {
  noteId: NoteId;
  content?: string;
  priority?: string;
  type?: string;
  scope?: string;
  status?: string;
}

export interface UpdateNoteOutput {
  note: NoteDto;
}

export class UpdateNoteUseCase {
  constructor(private readonly storage: StoragePort) {}

  async execute(input: UpdateNoteInput): Promise<UpdateNoteOutput> {
    const cfg = await this.storage.loadConfig();
    const files = await this.storage.listNoteFiles();
    for (const fp of files) {
      const data = await this.storage.loadNotes(fp);
      if (!data) continue;
      const idx = data.notes.findIndex((n) => n.id === input.noteId);
      if (idx < 0) continue;
      const n = data.notes[idx];
      if (input.content !== undefined) n.content = input.content.trim();
      if (input.priority !== undefined) {
        if (!cfg.priorities.some((p) => p.name === input.priority)) {
          throw new DomainError(`Invalid priority: ${input.priority}`);
        }
        n.priority = input.priority;
      }
      if (input.type !== undefined) {
        if (!cfg.types.includes(input.type)) throw new DomainError(`Invalid type: ${input.type}`);
        n.type = input.type;
      }
      if (input.scope !== undefined) {
        if (!cfg.scopes.includes(input.scope)) throw new DomainError(`Invalid scope: ${input.scope}`);
        n.scope = input.scope;
      }
      if (input.status !== undefined) {
        if (!cfg.statuses.includes(input.status)) throw new DomainError(`Invalid status: ${input.status}`);
        n.status = input.status;
      }
      n.updatedAt = new Date().toISOString();
      await this.storage.saveNotes(fp, data);
      return { note: storedNoteToDto(n, String(fp)) };
    }
    throw new DomainError(`Note not found: ${input.noteId}`);
  }
}
