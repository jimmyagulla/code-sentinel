import { create } from 'zustand';
import type { NoteDto } from '../../../../application/dtos/NoteDto';
import type { NotesPanelNotesMessage } from '../../../../application/dtos/notesPanelMessage';

export type NotesPanelDataPayload = Omit<NotesPanelNotesMessage, 'type'>;

type NotesPanelDataState = {
  notes: NoteDto[];
  priorities: NotesPanelNotesMessage['priorities'];
  configTypes: string[];
  configScopes: string[];
  configStatuses: string[];
  setFromNotesMessage: (data: NotesPanelDataPayload) => void;
};

export const useNotesPanelDataStore = create<NotesPanelDataState>((set) => ({
  notes: [] as NoteDto[],
  priorities: [] as NotesPanelNotesMessage['priorities'],
  configTypes: [] as string[],
  configScopes: [] as string[],
  configStatuses: [] as string[],
  setFromNotesMessage: (data) =>
    set({
      notes: data.payload,
      priorities: data.priorities ?? [],
      configTypes: data.types ?? [],
      configScopes: data.scopes ?? [],
      configStatuses: data.statuses ?? [],
    }),
}));
