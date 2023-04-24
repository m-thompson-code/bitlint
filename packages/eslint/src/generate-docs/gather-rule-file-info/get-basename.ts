import { getFilename } from "./get-filename";

export function getBaseName(path: string) {
  const filename = getFilename(path);
  const parts = filename.split('.');

  if (parts.length > 1) {
    // Remove extension
    parts.pop();
  }

  return parts.join('.');
}
