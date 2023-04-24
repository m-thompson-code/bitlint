/**
 * Strips filename from filepath:
 *
 * `full/path/to/file.ts` -> `file.ts`
 */
export function getFilename(path: string) {
  const parts = path.split('/');

  return parts[parts.length - 1];
}
