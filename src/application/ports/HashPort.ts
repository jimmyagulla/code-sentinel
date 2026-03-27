/** Content hashing for anchors (SHA-256 hex with prefix). */
export interface HashPort {
  sha256Hex(content: string): string;
  /** Cryptographically random UUID for new note ids (RFC 4122). */
  randomUuid(): string;
}
