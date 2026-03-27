import type { Author } from '../value-objects/Author';
import type { ContentAnchor } from '../value-objects/ContentAnchor';
import type { NoteId } from '../value-objects/NoteId';
import type { FilePath } from '../value-objects/FilePath';
import type { NoteScope } from '../value-objects/NoteScope';
import type { NoteStatus } from '../value-objects/NoteStatus';
import type { NoteType } from '../value-objects/NoteType';
import type { Priority } from '../value-objects/Priority';

export interface Note {
  readonly id: NoteId;
  filePath: FilePath;
  anchor: ContentAnchor;
  content: string;
  priority: Priority;
  type: NoteType;
  scope: NoteScope;
  status: NoteStatus;
  author: Author;
  readonly createdAt: Date;
  updatedAt: Date;
}
