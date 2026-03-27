import React, { useMemo, type ReactElement } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { NoteEditDialog } from '../../NoteEditDialog';
import { useVscodeApi } from '../../contexts/VscodeApiProvider';
import { webviewHostService } from '../../services/webviewHostService';
import { useNotesPanelDataStore } from '../../stores/notesPanelDataStore';
import { useNotesPanelStore } from '../../stores/notesPanelStore';
import { Button } from '../ui/button';
import type { NoteDto } from '../../../../../application/dtos/NoteDto';

const iconBtnClass =
  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md p-0 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-3';

/**
 * Full-width list row for the Explorer “current file” notes view (no card chrome).
 * Separators are provided by the parent list (`divide-y`).
 */
export function CurrentFileNoteRow({ note }: { note: NoteDto }): ReactElement {
  const vscode = useVscodeApi();
  const editNote = useNotesPanelStore((s) => s.editNote);
  const setEditNote = useNotesPanelStore((s) => s.setEditNote);
  const priorities = useNotesPanelDataStore((s) => s.priorities);
  const configTypes = useNotesPanelDataStore((s) => s.configTypes);
  const configScopes = useNotesPanelDataStore((s) => s.configScopes);
  const configStatuses = useNotesPanelDataStore((s) => s.configStatuses);

  const priorityNames = useMemo(() => priorities.map((p) => p.name), [priorities]);

  const priorityBadgeColor = useMemo(() => {
    const p = priorities.find((x) => x.name === note.priority);
    return p?.color ?? 'var(--muted-foreground)';
  }, [priorities, note.priority]);

  const configReady = useMemo(
    () =>
      priorityNames.length > 0 &&
      configTypes.length > 0 &&
      configScopes.length > 0 &&
      configStatuses.length > 0,
    [priorityNames, configTypes, configScopes, configStatuses]
  );

  const isEditingThisNote = configReady && editNote?.id === note.id;

  return (
    <li className="list-none w-full min-w-0">
      <div className="flex w-full min-w-0 items-start gap-1.5 pl-2.5 pr-0 py-1.5 text-[12px] leading-snug">
        <button
          type="button"
          onClick={() => {
            webviewHostService.navigateToFile(vscode, note.filePath, note.anchor.startLine);
          }}
          className="m-0 min-w-0 flex-1 cursor-pointer rounded-sm border-0 bg-transparent text-left font-inherit text-inherit antialiased outline-none transition-colors hover:bg-accent/50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div className="mb-0.5 flex flex-wrap items-center gap-1">
            <span
              className="inline-flex items-center rounded border border-border bg-muted/80 px-1 py-px text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
              style={{ color: priorityBadgeColor }}
            >
              {note.priority}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {note.type}
              <span className="mx-0.5 text-border">·</span>
              {note.scope}
            </span>
          </div>
          <div className="line-clamp-3 text-foreground">{note.content}</div>
        </button>

        <div className="flex shrink-0 flex-row items-start gap-0.5 pt-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title={configReady ? 'Edit note' : 'Loading note options…'}
            aria-label="Edit note"
            disabled={!configReady}
            onClick={(e) => {
              e.stopPropagation();
              setEditNote(note);
            }}
            className={iconBtnClass}
          >
            <Pencil aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Delete note"
            aria-label="Delete note"
            onClick={(e) => {
              e.stopPropagation();
              webviewHostService.deleteNote(vscode, note.id);
            }}
            className={`${iconBtnClass} text-destructive hover:bg-destructive/12 hover:text-destructive`}
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      </div>

      {isEditingThisNote && editNote && (
        <NoteEditDialog key={editNote.id} note={editNote} onClose={() => setEditNote(null)} />
      )}
    </li>
  );
}
