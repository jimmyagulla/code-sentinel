import type { NoteDto } from '../dtos/NoteDto';
import type { StoredNote } from '../dtos/FileNoteData';

export function storedNoteToDto(n: StoredNote, filePath: string): NoteDto {
  return {
    id: n.id,
    filePath,
    anchor: {
      startLine: n.anchor.startLine,
      endLine: n.anchor.endLine,
      contentHash: n.anchor.contentHash,
      snippet: n.anchor.snippet,
    },
    content: n.content,
    priority: n.priority,
    type: n.type,
    scope: n.scope,
    status: n.status,
    author: n.author,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  };
}
