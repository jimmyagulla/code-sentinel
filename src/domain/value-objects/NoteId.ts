import { DomainError } from '../errors/DomainErrors';

export type NoteId = string & { readonly __brand: 'NoteId' };

export function createNoteId(value: string): NoteId {
  if (!value || !value.trim()) {
    throw new DomainError('NoteId must be non-empty');
  }
  return value.trim() as NoteId;
}
