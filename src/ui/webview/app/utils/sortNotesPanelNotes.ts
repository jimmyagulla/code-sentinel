import type { NoteDto } from '../../../../application/dtos/NoteDto';
import { UNKNOWN_PRIORITY_ORDINAL } from '../../../../constants/unknownPriorityOrdinal';
import type { NotesPanelSortBy } from '../stores/notesPanelStore';

type PriorityOrdinal = { name: string; ordinal: number };

/**
 * Stable sort for the notes panel list (copy; does not mutate input).
 */
export function sortNotesPanelNotes(
  notes: readonly NoteDto[],
  sortBy: NotesPanelSortBy,
  priorities: readonly PriorityOrdinal[]
): NoteDto[] {
  const orderMap = new Map(priorities.map((p) => [p.name, p.ordinal]));
  return [...notes].sort((a, b) => {
    switch (sortBy) {
      case 'file':
        return a.filePath.localeCompare(b.filePath);
      case 'type':
        return a.type.localeCompare(b.type);
      case 'scope':
        return a.scope.localeCompare(b.scope);
      case 'priority': {
        const oa = orderMap.get(a.priority) ?? UNKNOWN_PRIORITY_ORDINAL;
        const ob = orderMap.get(b.priority) ?? UNKNOWN_PRIORITY_ORDINAL;
        return oa - ob;
      }
    }
  });
}
