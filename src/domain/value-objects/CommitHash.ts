export type CommitHash = string & { readonly __brand: 'CommitHash' };

export function toCommitHash(value: string): CommitHash {
  return value as CommitHash;
}
