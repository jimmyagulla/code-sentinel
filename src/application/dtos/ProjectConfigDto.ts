import type { FileStatusValue } from '../../domain/value-objects/FileStatusValue';

export interface ProjectConfigDto {
  version: number;
  priorities: { name: string; ordinal: number; color: string }[];
  types: string[];
  scopes: string[];
  statuses: string[];
  fileStatusDefaults: {
    defaultStatus: FileStatusValue;
    excludePatterns: string[];
  };
  /** Last HEAD commit hash used for rename reconciliation */
  lastReconcileCommit?: string;
}
