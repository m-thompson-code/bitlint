import { globSync } from 'glob';
import { join } from 'path';
import { getFilename } from './get-filename';
import { getBaseName } from './get-basename';

/**
 * Collection of rule's filename, full path to its rule and spec file.
 */
export interface RuleFileInfo {
  /** example: `file-name` (excludes extension) */
  baseName: string;
  /** example: `absolute/path/to/file/file-name.ts` */
  rule: string;
  /** example: `absolute/path/to/file/file-name.spec.ts` */
  spec: string;
}

/**
 * Collection file's base name, full path and file name.
 */
export interface GlobInfo {
  /** example: `file-name` (excludes extension) */
  baseName: string;
  /** example: `absolute/path/to/file/file-name.ts` */
  filepath: string;
  /** example: `file-name.ts` */
  filename: string;
}

/**
 * Gather file info for all rules in given directory
 * (Assumes filenames follow lower-snake-case.ts and lower-snake-case.spec.ts pattern)
 * @param sourcePath Directory to scrape for rules
 * @returns array of RuleFileInfo objects, which indicate the path to the rule's code and spec files
 */
export function gatherRuleFileInfo(sourcePath: string): RuleFileInfo[] {
  const files: GlobInfo[] = globSync(join(sourcePath, '**/*.ts'), { ignore: 'node_modules/**' })
  .map(filepath => {
    const filename = getFilename(filepath);
    const baseName = getBaseName(filepath);

    return { filename, filepath, baseName };
  });

  const ruleFiles: GlobInfo[] = [];
  const specFiles: GlobInfo[] = [];

  files.forEach(file => {
    if (file.filename.endsWith('.spec.ts')) {
      specFiles.push(file);
    } else {
      ruleFiles.push(file);
    }
  });

  const existingFiles: Record<string, RuleFileInfo> = {};

  return ruleFiles
    .filter((file) => {
      const { baseName, filepath } = file;

      if (existingFiles[baseName]) {
        console.warn(`Duplicate rule found at ${filepath}. Skipping`);
        return false;
      }

      const spec = specFiles.find(specFile => specFile.filename.includes(`${baseName}.spec.ts`));

      if (!spec) {
        console.warn(`Couldn't find spec file for ${filepath}`);
        return false;
      }

      existingFiles[baseName] = {
        baseName,
        rule: file.filepath,
        spec: spec.filepath,
      };

      return true;
    })
    .map((file) => {
      const ruleFileInfo = existingFiles[file.baseName];

      if (!ruleFileInfo) {
        throw new Error("Unexpected file missing from RuleFileInfos");
      }

      return ruleFileInfo;
    });
}
