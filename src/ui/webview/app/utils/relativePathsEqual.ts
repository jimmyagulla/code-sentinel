/**
 * Compare workspace-relative paths across Windows/Unix and casing.
 */
export function relativePathsEqual(a: string, b: string): boolean {
  return a.replace(/\\/g, '/').toLowerCase() === b.replace(/\\/g, '/').toLowerCase();
}
