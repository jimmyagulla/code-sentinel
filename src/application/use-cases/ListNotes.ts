import type { FilePath } from '../../domain/value-objects/FilePath';
import type { StoragePort } from '../ports/StoragePort';
import type { NoteDto } from '../dtos/NoteDto';
import { storedNoteToDto } from '../mappers/noteMappers';
import { UNKNOWN_PRIORITY_ORDINAL } from '../../constants/unknownPriorityOrdinal';

export interface ListNotesInput {
  filters?: {
    filePath?: FilePath;
    priority?: string;
    type?: string;
    scope?: string;
    status?: string;
  };
  sortBy?: 'priority' | 'file' | 'type' | 'scope' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ListNotesOutput {
  notes: NoteDto[];
}

export class ListNotesUseCase {
  constructor(private readonly storage: StoragePort) {}

  async execute(input: ListNotesInput): Promise<ListNotesOutput> {
    const cfg = await this.storage.loadConfig();
    const priorityOrder = new Map(cfg.priorities.map((p) => [p.name, p.ordinal]));
    const files = await this.storage.listNoteFiles();
    const notes: NoteDto[] = [];
    for (const fp of files) {
      if (input.filters?.filePath && String(fp) !== String(input.filters.filePath)) continue;
      const data = await this.storage.loadNotes(fp);
      if (!data) continue;
      for (const n of data.notes) {
        if (input.filters?.priority && n.priority !== input.filters.priority) continue;
        if (input.filters?.type && n.type !== input.filters.type) continue;
        if (input.filters?.scope && n.scope !== input.filters.scope) continue;
        if (input.filters?.status && n.status !== input.filters.status) continue;
        notes.push(storedNoteToDto(n, String(fp)));
      }
    }

    const order = input.sortOrder === 'desc' ? -1 : 1;
    const sortBy = input.sortBy ?? 'priority';
    notes.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'priority': {
          const oa = priorityOrder.get(a.priority) ?? UNKNOWN_PRIORITY_ORDINAL;
          const ob = priorityOrder.get(b.priority) ?? UNKNOWN_PRIORITY_ORDINAL;
          cmp = oa - ob;
          break;
        }
        case 'file':
          cmp = a.filePath.localeCompare(b.filePath);
          break;
        case 'type':
          cmp = a.type.localeCompare(b.type);
          break;
        case 'scope':
          cmp = a.scope.localeCompare(b.scope);
          break;
        case 'createdAt':
          cmp = a.createdAt.localeCompare(b.createdAt);
          break;
        default:
          cmp = 0;
      }
      return cmp * order;
    });

    return { notes };
  }
}
