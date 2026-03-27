import type { NoteDto } from './NoteDto';
import type { ProjectConfigDto } from './ProjectConfigDto';

/**
 * Message from extension host → notes webview when refreshing the list (`postMessage`).
 * Same shapes as `listNotes` output plus project config pick lists.
 */
export type NotesPanelNotesMessage = {
  type: 'notes';
  payload: NoteDto[];
  priorities: ProjectConfigDto['priorities'];
  types: ProjectConfigDto['types'];
  scopes: ProjectConfigDto['scopes'];
  statuses: ProjectConfigDto['statuses'];
};
