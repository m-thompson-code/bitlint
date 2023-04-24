import { existsSync } from "fs";
import { join } from "path";

export function getDefaultTsConfig(path: string): string | undefined {
  if (existsSync(join(path, 'tsconfig.json'))) {
    return join(path, 'tsconfig.json');
  }

  if (existsSync(join(path, 'tsconfig.lint.json'))) {
    return join(path, 'tsconfig.lint.json');
  }

  return;
}
