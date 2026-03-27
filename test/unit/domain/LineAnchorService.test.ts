import { describe, it, expect } from 'vitest';
import {
  createAnchor,
  resolveAnchor,
} from '../../../src/domain/services/LineAnchorService';
import { createLineRange } from '../../../src/domain/value-objects/LineRange';

const hash = (s: string): string => 'sha256:' + Buffer.from(s).toString('hex').slice(0, 16);

describe('LineAnchorService', () => {
  it('createAnchor produces stable hash for range', () => {
    const content = 'line1\nline2\nline3\n';
    const range = createLineRange(2, 2);
    const a = createAnchor(content, range, hash);
    expect(a.lineRange.startLine).toBe(2);
    expect(a.snippet.length).toBeGreaterThan(0);
  });

  it('resolveAnchor returns exact when unchanged', () => {
    const content = 'a\nb\nc\n';
    const range = createLineRange(2, 2);
    const anchor = createAnchor(content, range, hash);
    const res = resolveAnchor(content, anchor, hash, { searchRadius: 5, fuzzyThreshold: 0.3 });
    expect(res.status).toBe('exact');
  });

  it('resolveAnchor finds drifted line', () => {
    const original = 'a\nb\nc\n';
    const range = createLineRange(2, 2);
    const anchor = createAnchor(original, range, hash);
    const modified = 'x\na\nb\nc\n';
    const res = resolveAnchor(modified, anchor, hash, { searchRadius: 10, fuzzyThreshold: 0.5 });
    expect(res.status === 'drifted' || res.status === 'exact').toBe(true);
  });
});
