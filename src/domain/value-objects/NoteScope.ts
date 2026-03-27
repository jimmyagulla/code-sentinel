import { DomainError } from '../errors/DomainErrors';

export type NoteScope = string & { readonly __brand: 'NoteScope' };

export function toNoteScope(value: string): NoteScope {
  if (!value || !value.trim()) {
    throw new DomainError('NoteScope must be non-empty');
  }
  return value.trim() as NoteScope;
}
