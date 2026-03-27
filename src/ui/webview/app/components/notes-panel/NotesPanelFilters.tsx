import React, { type ReactElement } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useNotesPanelStore, type NotesPanelSortBy } from '../../stores/notesPanelStore';

const fieldLabelClass = 'text-[11px] font-semibold uppercase tracking-wide text-muted-foreground';

export function NotesPanelFilters(): ReactElement {
  const filter = useNotesPanelStore((s) => s.filter);
  const setFilter = useNotesPanelStore((s) => s.setFilter);
  const sortBy = useNotesPanelStore((s) => s.sortBy);
  const setSortBy = useNotesPanelStore((s) => s.setSortBy);

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
      <div className="flex min-w-0 flex-col gap-1.5">
        <Label htmlFor="cs-filter" className={fieldLabelClass}>
          Search
        </Label>
        <Input
          id="cs-filter"
          type="search"
          placeholder="Filter by text or path…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <Label htmlFor="cs-sort" className={fieldLabelClass}>
          Sort by
        </Label>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as NotesPanelSortBy)}>
          <SelectTrigger id="cs-sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="file">File</SelectItem>
            <SelectItem value="type">Type</SelectItem>
            <SelectItem value="scope">Scope</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
