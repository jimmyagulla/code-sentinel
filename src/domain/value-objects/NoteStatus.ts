import { DomainError } from '../errors/DomainErrors';

export type NoteStatus = string & { readonly __brand: 'NoteStatus' };

export function toNoteStatus(value: string): NoteStatus {
  if (!value || !value.trim()) {
    throw new DomainError('NoteStatus must be non-empty');
  }
  return value.trim() as NoteStatus;
}
