import type { ContentAnchor } from '../value-objects/ContentAnchor';
import { createLineRange, type LineRange } from '../value-objects/LineRange';

/** Pluggable SHA-256 hex hasher (injected from adapter layer using Node crypto). */
export type ContentHasher = (content: string) => string;

export type AnchorResolution =
  | { status: 'exact'; lineRange: LineRange }
  | { status: 'drifted'; lineRange: LineRange; newHash: string; newSnippet: string }
  | { status: 'lost' };

const SNIPPET_MAX = 120;

function extractLines(fileContent: string, lineRange: LineRange): string {
  const lines = fileContent.split(/\r?\n/);
  const start = lineRange.startLine - 1;
  const end = lineRange.endLine;
  if (start < 0 || start >= lines.length) {
    return '';
  }
  return lines.slice(start, end).join('\n');
}

function makeSnippet(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length <= SNIPPET_MAX ? t : t.slice(0, SNIPPET_MAX);
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (b[i - 1] === a[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j]);
      }
    }
  }
  return dp[n][m];
}

function normalizedLevenshteinRatio(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length, 1);
  return levenshteinDistance(a, b) / maxLen;
}

export function createAnchor(
  fileContent: string,
  lineRange: LineRange,
  hash: ContentHasher
): ContentAnchor {
  const block = extractLines(fileContent, lineRange);
  return {
    lineRange,
    contentHash: hash(block),
    snippet: makeSnippet(block),
  };
}

export function resolveAnchor(
  fileContent: string,
  anchor: ContentAnchor,
  hash: ContentHasher,
  options: { searchRadius: number; fuzzyThreshold: number }
): AnchorResolution {
  const block = extractLines(fileContent, anchor.lineRange);
  if (hash(block) === anchor.contentHash) {
    return { status: 'exact', lineRange: anchor.lineRange };
  }

  const lines = fileContent.split(/\r?\n/);
  const lineCount = lines.length;
  const span = anchor.lineRange.endLine - anchor.lineRange.startLine + 1;
  const startMin = Math.max(1, anchor.lineRange.startLine - options.searchRadius);
  const startMax = Math.min(lineCount - span + 1, anchor.lineRange.startLine + options.searchRadius);

  for (let start = startMin; start <= startMax; start++) {
    const endLine = start + span - 1;
    if (endLine > lineCount) continue;
    const range = createLineRange(start, endLine);
    const candidate = extractLines(fileContent, range);
    if (hash(candidate) === anchor.contentHash) {
      return {
        status: 'drifted',
        lineRange: range,
        newHash: anchor.contentHash,
        newSnippet: makeSnippet(candidate),
      };
    }
  }

  const snippetNorm = anchor.snippet.replace(/\s+/g, ' ').trim();
  let bestStart = -1;
  let bestRatio = 1;
  for (let start = 1; start <= lineCount; start++) {
    const endLine = Math.min(lineCount, start + span - 1);
    const range = createLineRange(start, endLine);
    const candidate = extractLines(fileContent, range);
    const candNorm = candidate.replace(/\s+/g, ' ').trim();
    const ratio = normalizedLevenshteinRatio(snippetNorm, candNorm);
    if (ratio < bestRatio) {
      bestRatio = ratio;
      bestStart = start;
    }
  }

  if (bestStart > 0 && bestRatio <= options.fuzzyThreshold) {
    const endLine = Math.min(lineCount, bestStart + span - 1);
    const range = createLineRange(bestStart, endLine);
    const candidate = extractLines(fileContent, range);
    return {
      status: 'drifted',
      lineRange: range,
      newHash: hash(candidate),
      newSnippet: makeSnippet(candidate),
    };
  }

  return { status: 'lost' };
}
