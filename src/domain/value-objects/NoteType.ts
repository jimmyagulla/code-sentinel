import { DomainError } from '../errors/DomainErrors';

export type NoteType = string & { readonly __brand: 'NoteType' };

export function toNoteType(value: string): NoteType {
  if (!value || !value.trim()) {
    throw new DomainError('NoteType must be non-empty');
  }
  return value.trim() as NoteType;
}
