import React, { useEffect, useMemo, type ReactElement } from 'react';
import { CurrentFileScopeSync } from './components/CurrentFileScopeSync';
import { NotesPanelFilters } from './components/notes-panel/NotesPanelFilters';
import { useWebviewHostMessageHandler } from './contexts/WebviewHostMessageProvider';
import { useNotesPanelDataStore } from './stores/notesPanelDataStore';
import { useNotesPanelStore } from './stores/notesPanelStore';
import { CurrentFileNoteRow } from './components/notes-panel/CurrentFileNoteRow';
import { NotesPanelNoteCard } from './components/notes-panel/NotesPanelNoteCard';
import type { NotesPanelNotesMessage } from '../../../application/dtos/notesPanelMessage';
import { filterNotesPanelNotes } from './utils/filterNotesPanelNotes';
import { sortNotesPanelNotes } from './utils/sortNotesPanelNotes';
import { relativePathsEqual } from './utils/relativePathsEqual';

function getNotesScope(): 'workspace' | 'current-file' {
  return document.body.dataset.notesScope === 'current-file' ? 'current-file' : 'workspace';
}

export function App(): ReactElement {
  const notesScope = useMemo(() => getNotesScope(), []);
  const notes = useNotesPanelDataStore((s) => s.notes);
  const priorities = useNotesPanelDataStore((s) => s.priorities);
  const setFromNotesMessage = useNotesPanelDataStore((s) => s.setFromNotesMessage);
  const filter = useNotesPanelStore((s) => s.filter);
  const sortBy = useNotesPanelStore((s) => s.sortBy);
  const activeFilePath = useNotesPanelStore((s) => s.activeFilePath);
  const editNote = useNotesPanelStore((s) => s.editNote);
  const setEditNote = useNotesPanelStore((s) => s.setEditNote);

  useWebviewHostMessageHandler('notes', (data) => {
    const msg = data as NotesPanelNotesMessage;
    if (msg.type !== 'notes' || !('payload' in msg) || !msg.payload) {
      return;
    }
    setFromNotesMessage({
      payload: msg.payload,
      priorities: msg.priorities,
      types: msg.types,
      scopes: msg.scopes,
      statuses: msg.statuses,
    });
  });

  const scopedNotes = useMemo(() => {
    if (notesScope !== 'current-file') {
      return notes;
    }
    if (!activeFilePath) {
      return [];
    }
    return notes.filter((n) => relativePathsEqual(n.filePath, activeFilePath));
  }, [notes, notesScope, activeFilePath]);

  const visibleNotes = useMemo(
    () => sortNotesPanelNotes(filterNotesPanelNotes(scopedNotes, filter), sortBy, priorities),
    [scopedNotes, filter, sortBy, priorities]
  );

  useEffect(() => {
    if (editNote && !visibleNotes.some((n) => n.id === editNote.id)) {
      setEditNote(null);
    }
  }, [visibleNotes, editNote, setEditNote]);

  const emptyState = useMemo((): ReactElement => {
    if (notesScope === 'current-file' && !activeFilePath) {
      return (
        <>
          <p className="text-sm text-muted-foreground">Open a file in the editor to see its notes.</p>
          <p className="mt-1 text-xs text-muted-foreground/80">The list updates when you switch tabs.</p>
        </>
      );
    }
    if (notesScope === 'current-file' && activeFilePath && scopedNotes.length === 0) {
      return <p className="text-sm text-muted-foreground">No notes on this file.</p>;
    }
    if (scopedNotes.length > 0 && visibleNotes.length === 0) {
      return (
        <>
          <p className="text-sm text-muted-foreground">No notes match your filters.</p>
          <p className="mt-1 text-xs text-muted-foreground/80">Try another search or clear the filter.</p>
        </>
      );
    }
    return (
      <>
        <p className="text-sm text-muted-foreground">No notes match your filters.</p>
        <p className="mt-1 text-xs text-muted-foreground/80">Try another search or clear the filter.</p>
      </>
    );
  }, [notesScope, activeFilePath, scopedNotes.length, visibleNotes.length]);

  const densityClass =
    notesScope === 'current-file'
      ? 'gap-0 p-0 text-[12px] leading-snug'
      : 'gap-4 p-3 text-sm leading-normal';

  const listClass =
    notesScope === 'current-file'
      ? 'm-0 w-full min-w-0 list-none divide-y divide-border p-0'
      : 'flex w-full min-w-0 flex-col gap-2.5';
  const emptyListClass =
    notesScope === 'current-file' ? 'py-6 text-center' : 'rounded-xl px-4 py-12 text-center';

  return (
    <div
      className={`flex min-h-0 w-full min-w-0 flex-1 flex-col font-sans text-foreground antialiased ${densityClass}`}
    >
      {notesScope === 'current-file' && <CurrentFileScopeSync />}

      {notesScope === 'workspace' && <NotesPanelFilters />}

      <div
        className={`min-h-0 w-full min-w-0 flex-1 overflow-auto ${notesScope === 'current-file' ? 'overflow-x-hidden' : ''}`}
      >
        <ul className={listClass}>
          {visibleNotes.length === 0 ? (
            <li className={emptyListClass}>{emptyState}</li>
          ) : notesScope === 'current-file' ? (
            visibleNotes.map((n) => <CurrentFileNoteRow key={n.id} note={n} />)
          ) : (
            visibleNotes.map((n) => (
              <li key={n.id} className="list-none">
                <NotesPanelNoteCard note={n} />
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
