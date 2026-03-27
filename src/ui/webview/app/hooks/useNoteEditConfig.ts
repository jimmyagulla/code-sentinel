import { useMemo } from 'react';
import { useNotesPanelDataStore } from '../stores/notesPanelDataStore';

/** Priority names, types, scopes, statuses from panel data (Zustand). */
export function useNoteEditConfig(): {
  priorityNames: string[];
  types: string[];
  scopes: string[];
  statuses: string[];
} {
  const priorities = useNotesPanelDataStore((s) => s.priorities);
  const types = useNotesPanelDataStore((s) => s.configTypes);
  const scopes = useNotesPanelDataStore((s) => s.configScopes);
  const statuses = useNotesPanelDataStore((s) => s.configStatuses);

  const priorityNames = useMemo(() => priorities.map((p) => p.name), [priorities]);

  return { priorityNames, types, scopes, statuses };
}
