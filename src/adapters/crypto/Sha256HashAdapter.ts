import { createHash, randomUUID } from 'crypto';
import type { HashPort } from '../../application/ports/HashPort';

export class Sha256HashAdapter implements HashPort {
  sha256Hex(content: string): string {
    const hex = createHash('sha256').update(content, 'utf8').digest('hex');
    return `sha256:${hex}`;
  }

  randomUuid(): string {
    return randomUUID();
  }
}
