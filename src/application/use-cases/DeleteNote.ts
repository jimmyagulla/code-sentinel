import type { NoteId } from '../../domain/value-objects/NoteId';
import type { StoragePort } from '../ports/StoragePort';

export interface DeleteNoteInput {
  noteId: NoteId;
}

export interface DeleteNoteOutput {
  success: boolean;
}

export class DeleteNoteUseCase {
  constructor(private readonly storage: StoragePort) {}

  async execute(input: DeleteNoteInput): Promise<DeleteNoteOutput> {
    const files = await this.storage.listNoteFiles();
    for (const fp of files) {
      const data = await this.storage.loadNotes(fp);
      if (!data) continue;
      const before = data.notes.length;
      data.notes = data.notes.filter((n) => n.id !== input.noteId);
      if (data.notes.length < before) {
        if (data.notes.length === 0) {
          await this.storage.deleteNoteFile(fp);
        } else {
          await this.storage.saveNotes(fp, data);
        }
        return { success: true };
      }
    }
    return { success: false };
  }
}
