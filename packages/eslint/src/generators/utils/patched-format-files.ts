import { readJson, Tree, formatFiles as _formatFiles, NX_VERSION } from '@nrwl/devkit';
import * as path from 'path';
import type * as Prettier from 'prettier';
import { compare } from 'semver';

export async function formatFiles(tree: Tree): Promise<void> {
  // Formatting without a prettier config isn't supported until 15.9.2
  // Because of this, we have to attempt to use a patched version of formatFiles
  if (compare('15.9.2', NX_VERSION) < 0) {
    // nx version meets minimum version, so avoid using patch
    await _formatFiles(tree);
    return
  }

  try {
    await patchedFormatFiles(tree);
  } catch {
    await _formatFiles(tree);
  }
}

/**
 * Formats all the created or updated files using Prettier
 * @param tree - the file system tree
 */
async function patchedFormatFiles(tree: Tree): Promise<void> {
  let _prettier: typeof Prettier | undefined = undefined;
  try {
    _prettier = await import('prettier');
  } catch {/* empty */}

  // TODO: investigate how old of nx can be used to make this work if we copy it over
  // sortTsConfig(tree);

  if (!_prettier) return;

  const prettier = _prettier;

  const files = new Set(
    tree.listChanges().filter((file) => file.type !== 'DELETE')
  );

  await Promise.all(
    Array.from(files).map(async (file) => {
      const systemPath = path.join(tree.root, file.path);

      const resolvedOptions = await prettier.resolveConfig(systemPath, {
        editorconfig: true,
      });

      let optionsFromTree;
      if (!resolvedOptions) {
        try {
          optionsFromTree = readJson(tree, '.prettierrc');
        } catch {/* empty */}
      }
      const options: any = {
        filepath: systemPath,
        ...(resolvedOptions ?? optionsFromTree),
      };

      if (file.path.endsWith('.swcrc')) {
        options.parser = 'json';
      }

      const support = await prettier.getFileInfo(systemPath, options);
      if (support.ignored || !support.inferredParser) {
        return;
      }

      try {
        if (!file.content) {
          return;
        }

        tree.write(
          file.path,
          prettier.format(file.content.toString('utf-8'), options)
        );
      } catch (e) {
        if (e instanceof Error) {
          console.warn(`Could not format ${file.path}. Error: "${e.message}"`);
        } else {
          console.warn(`Could not format ${file.path}. Error: "${e}"`);
        }
      }
    })
  );
}
