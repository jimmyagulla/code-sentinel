import type { LineRange } from './LineRange';

export interface ContentAnchor {
  readonly lineRange: LineRange;
  readonly contentHash: string;
  readonly snippet: string;
}
