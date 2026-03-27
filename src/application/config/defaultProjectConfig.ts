import type { ProjectConfigDto } from '../dtos/ProjectConfigDto';
import { FileStatusValue } from '../../domain/value-objects/FileStatusValue';

export const CURRENT_CONFIG_VERSION = 1;

export function createDefaultProjectConfig(): ProjectConfigDto {
  return {
    version: CURRENT_CONFIG_VERSION,
    priorities: [
      { name: 'CRITICAL', ordinal: 0, color: '#DC2626' },
      { name: 'HIGH', ordinal: 1, color: '#EA580C' },
      { name: 'MEDIUM', ordinal: 2, color: '#CA8A04' },
      { name: 'LOW', ordinal: 3, color: '#16A34A' },
      { name: 'INFO', ordinal: 4, color: '#2563EB' },
    ],
    types: ['TECHNICAL_DEBT', 'IMPROVEMENT', 'WARNING', 'BUG', 'TODO'],
    scopes: ['PERFORMANCE', 'SECURITY', 'MAINTAINABILITY', 'ARCHITECTURE', 'READABILITY'],
    statuses: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'WONTFIX'],
    fileStatusDefaults: {
      defaultStatus: FileStatusValue.NEEDS_REVIEW,
      excludePatterns: ['*.test.ts', '*.spec.ts', '*.d.ts', 'dist/**', 'node_modules/**'],
    },
  };
}
