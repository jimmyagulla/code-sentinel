import { DomainError } from '../errors/DomainErrors';
import type { FileHealth } from '../entities/FileHealth';
import { FileStatusValue } from '../value-objects/FileStatusValue';

export function canTransition(
  from: FileStatusValue,
  to: FileStatusValue,
  isAutomatic: boolean
): boolean {
  if (isAutomatic) {
    return from === FileStatusValue.OK && to === FileStatusValue.NEEDS_REVIEW;
  }
  const allowed: Record<FileStatusValue, FileStatusValue[]> = {
    [FileStatusValue.OK]: [
      FileStatusValue.NEEDS_REVIEW,
      FileStatusValue.KO,
    ],
    [FileStatusValue.NEEDS_REVIEW]: [FileStatusValue.OK, FileStatusValue.KO],
    [FileStatusValue.KO]: [FileStatusValue.NEEDS_REVIEW, FileStatusValue.OK],
  };
  return allowed[from]?.includes(to) ?? false;
}

export function applyManualTransition(
  health: FileHealth,
  to: FileStatusValue
): FileHealth {
  if (!canTransition(health.status, to, false)) {
    throw new DomainError(`Invalid transition ${health.status} -> ${to}`);
  }
  return { ...health, status: to };
}
