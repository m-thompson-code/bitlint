import { relative } from "path";

export function getRelativePath(from: string, to: string): string {
  return addRelativePathPrefix(relative(removeLeadingForwardSlash(from), removeLeadingForwardSlash(to)));
}

function removeLeadingForwardSlash(path: string): string {
  if (path.startsWith('/')) {
    return removeLeadingForwardSlash(path.substring(1));
  }

  return path;
}

function addRelativePathPrefix(path: string): string {
  if (path.startsWith('.')) {
    return path;
  }

  return `./${path}`;
}
