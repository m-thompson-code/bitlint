import { readdirSync } from 'fs';
import { glob, globSync, globStream, globStreamSync, Glob } from 'glob';
import { join } from 'path';

const INPUT_PATH = join(__dirname, 'tmp/nx-e2e/proj/libs/eslint6177853/src/rules');
// const outputPath = join(__dirname, 'docs');

function gatherRuleFileInfoByGlob(sourcePath: string) {
  const files = globSync(join(sourcePath, '**/*.ts'), { ignore: 'node_modules/**' })
  .map(filepath => {
    const filename = getFilename(filepath);
    const baseName = getBaseName(filepath);

    return { filename, filepath, baseName };
  });

  const ruleFiles: { filename: string; filepath: string; baseName: string }[] = [];
  const specFiles: { filename: string; filepath: string; baseName: string }[] = [];

  files.forEach(file => {
    if (file.filename.endsWith('.spec.ts')) {
      specFiles.push(file);
    } else {
      ruleFiles.push(file);
    }
  });

  const existingFiles: Record<string, {
    baseName: string;
    rule: string;
    spec: string;
  }> = {};

  return ruleFiles
    .filter((file) => {
      const { baseName, filepath, filename } = file;

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

/**
 * Gather file info for all rules in given directory
 * (Assumes filenames follow lower-snake-case.ts and lower-snake-case.spec.ts pattern)
 * @param sourcePath Directory to scrape for rules
 * @returns array of RuleFileInfo objects, which indicate the path to the rule's code and spec files
 */
function gatherRuleFileInfo(sourcePath: string) {
  const files = readdirSync(sourcePath).filter((name) =>
    name.match(/[a-z\-\.]+\.ts/)
  );
  const ruleFiles: string[] = [];
  const specFiles: string[] = [];

  files.forEach((file) => {
    if (file.endsWith('.spec.ts')) {
      specFiles.push(file);
    } else {
      ruleFiles.push(file);
    }
  });

  const fileInfo = ruleFiles
    .filter((file) => {
      const name = file.split('.')[0];
      if (!specFiles.includes(`${name}.spec.ts`)) {
        console.warn(`Couldn't find spec file for ${file}`);
        return false;
      }
      return true;
    })
    .map((file) => ({
      baseName: file.split('.')[0],
      rule: join(sourcePath, file),
      spec: join(sourcePath, `${file.split('.')[0]}.spec.ts`),
    }));

  return fileInfo;
}

console.log(gatherRuleFileInfo(INPUT_PATH));
console.log(gatherRuleFileInfoByGlob(INPUT_PATH));

/**
 * Strips filename from filepath:
 *
 * `full/path/to/file.ts` -> `file.ts`
 */
function getFilename(path: string) {
  const parts = path.split('/');

  return parts[parts.length - 1];
}

function getBaseName(path: string) {
  const filename = getFilename(path);
  const parts = filename.split('.');

  if (parts.length > 1) {
    // Remove extension
    parts.pop();
  }

  return parts.join('.');
}
