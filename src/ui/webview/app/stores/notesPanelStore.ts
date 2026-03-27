import { create } from 'zustand';
import type { NoteDto } from '../../../../application/dtos/NoteDto';

export type NotesPanelSortBy = 'priority' | 'file' | 'type' | 'scope';

type NotesPanelState = {
  filter: string;
  sortBy: NotesPanelSortBy;
  editNote: NoteDto | null;
  /** Workspace-relative path of the active editor (Explorer sidebar view only). */
  activeFilePath: string | null;
  setFilter: (value: string) => void;
  setSortBy: (value: NotesPanelSortBy) => void;
  setEditNote: (note: NoteDto | null) => void;
  setActiveFilePath: (path: string | null) => void;
};

export const useNotesPanelStore = create<NotesPanelState>((set) => ({
  filter: '',
  sortBy: 'priority',
  editNote: null,
  activeFilePath: null,
  setFilter: (filter) => set({ filter }),
  setSortBy: (sortBy) => set({ sortBy }),
  setEditNote: (editNote) => set({ editNote }),
  setActiveFilePath: (activeFilePath) => set({ activeFilePath }),
}));
