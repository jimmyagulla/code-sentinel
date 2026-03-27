import { describe, it, expect } from 'vitest';
import {
  canTransition,
  applyManualTransition,
} from '../../../src/domain/services/FileStatusTransitionService';
import { FileStatusValue } from '../../../src/domain/value-objects/FileStatusValue';
import type { FileHealth } from '../../../src/domain/entities/FileHealth';
import { toFilePath } from '../../../src/domain/value-objects/FilePath';

describe('FileStatusTransitionService', () => {
  it('allows automatic OK to NEEDS_REVIEW', () => {
    expect(canTransition(FileStatusValue.OK, FileStatusValue.NEEDS_REVIEW, true)).toBe(true);
  });

  it('disallows automatic arbitrary transitions', () => {
    expect(canTransition(FileStatusValue.NEEDS_REVIEW, FileStatusValue.OK, true)).toBe(false);
  });

  it('applyManualTransition updates status', () => {
    const h: FileHealth = {
      filePath: toFilePath('src/x.ts'),
      status: FileStatusValue.NEEDS_REVIEW,
      lastValidatedCommit: null,
      lastValidatedAt: null,
      validatedBy: null,
    };
    const next = applyManualTransition(h, FileStatusValue.OK);
    expect(next.status).toBe(FileStatusValue.OK);
  });
});
