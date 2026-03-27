import React, { useMemo, type ReactElement } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { NoteEditDialog } from '../../NoteEditDialog';
import { useVscodeApi } from '../../contexts/VscodeApiProvider';
import { webviewHostService } from '../../services/webviewHostService';
import { useNotesPanelDataStore } from '../../stores/notesPanelDataStore';
import { useNotesPanelStore } from '../../stores/notesPanelStore';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
import type { NoteDto } from '../../../../../application/dtos/NoteDto';

const iconActionClass =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:opacity-35 sm:h-9 sm:w-9';

function fileBasename(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  const i = normalized.lastIndexOf('/');
  return i >= 0 ? normalized.slice(i + 1) : normalized;
}

export interface NotesPanelNoteCardProps {
  note: NoteDto;
}

export function NotesPanelNoteCard({ note }: NotesPanelNoteCardProps): ReactElement {
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

  const navigateToNote = (): void => {
    webviewHostService.navigateToFile(vscode, note.filePath, note.anchor.startLine);
  };

  return (
    <>
      <Card
        className={cn(
          'w-full overflow-hidden rounded-2xl border bg-card shadow-md',
          'transition-[box-shadow,border-color] hover:border-muted-foreground/25 hover:shadow-lg'
        )}
      >
        <CardContent className="relative p-4">
          <button
            type="button"
            onClick={navigateToNote}
            className={cn(
              'w-full min-w-0 rounded-md pr-14 text-left font-inherit text-inherit antialiased outline-none',
              'transition-colors focus-visible:ring-2 focus-visible:ring-ring/35'
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center rounded-md border border-border/60 bg-muted/70 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide"
                style={{
                  color: priorityBadgeColor,
                  boxShadow: `inset 3px 0 0 0 ${priorityBadgeColor}`,
                }}
              >
                {note.priority}
              </span>
              <span className="inline-flex items-center rounded-md border border-border/60 bg-muted/80 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {note.type}
              </span>
              <span className="inline-flex items-center rounded-md border border-border/60 bg-muted/80 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {note.scope}
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-foreground/95">{note.content}</p>

            <span
              className="mt-1 block truncate font-mono text-xs text-muted-foreground"
              title={note.filePath}
            >
              {fileBasename(note.filePath)}
            </span>
          </button>

          <div className="absolute right-3 top-3 z-10 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title={configReady ? 'Edit note' : 'Loading note options…'}
              aria-label="Edit note"
              disabled={!configReady}
              onClick={() => setEditNote(note)}
              className={iconActionClass}
            >
              <Pencil className="size-3.5 sm:size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Delete note"
              aria-label="Delete note"
              onClick={() => webviewHostService.deleteNote(vscode, note.id)}
              className={`${iconActionClass} text-destructive/90 hover:bg-destructive/10 hover:text-destructive`}
            >
              <Trash2 className="size-3.5 sm:size-4" aria-hidden />
            </Button>
          </div>
        </CardContent>
      </Card>

      {isEditingThisNote && editNote && (
        <NoteEditDialog key={editNote.id} note={editNote} onClose={() => setEditNote(null)} />
      )}
    </>
  );
}
