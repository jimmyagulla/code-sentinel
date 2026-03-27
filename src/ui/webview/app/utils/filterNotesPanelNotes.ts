import type { NoteDto } from '../../../../application/dtos/NoteDto';

/**
 * Notes panel search: match `filterText` against content and file path (case-insensitive).
 * Empty `filterText` returns a shallow copy of all notes.
 */
export function filterNotesPanelNotes(
  notes: readonly NoteDto[],
  filterText: string
): NoteDto[] {
  if (!filterText) {
    return [...notes];
  }
  const q = filterText.toLowerCase();
  return notes.filter(
    (n) => n.content.toLowerCase().includes(q) || n.filePath.toLowerCase().includes(q)
  );
}
