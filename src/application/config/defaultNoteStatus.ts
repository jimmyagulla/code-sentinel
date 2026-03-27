import { DomainError } from '../../domain/errors/DomainErrors';
import type { ProjectConfigDto } from '../dtos/ProjectConfigDto';

/** First status for a new note: prefer `OPEN` when allowed by config, else first configured status. */
export function defaultInitialNoteStatus(cfg: ProjectConfigDto): string {
  if (cfg.statuses.length === 0) {
    throw new DomainError('Project config has no statuses');
  }
  return cfg.statuses.includes('OPEN') ? 'OPEN' : cfg.statuses[0];
}
