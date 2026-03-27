import { DomainError } from '../errors/DomainErrors';

export interface LineRange {
  readonly startLine: number;
  readonly endLine: number;
}

export function createLineRange(startLine: number, endLine: number): LineRange {
  if (startLine < 1 || endLine < startLine) {
    throw new DomainError('Invalid line range');
  }
  return { startLine, endLine };
}
