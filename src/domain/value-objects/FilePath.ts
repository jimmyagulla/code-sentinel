export type FilePath = string & { readonly __brand: 'FilePath' };

export function toFilePath(value: string): FilePath {
  const normalized = value.replace(/\\/g, '/').replace(/^\.\//, '');
  return normalized as FilePath;
}
