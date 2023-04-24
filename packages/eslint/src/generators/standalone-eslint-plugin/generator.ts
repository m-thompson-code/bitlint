import {
  Tree,
} from '@nrwl/devkit';
import { normalizeOptions } from '../eslint-plugin/utils/normalized-schema';
import { createEslintPlugin } from '../eslint-plugin/utils/create-eslint-plugin';
import { formatFiles } from '../utils/patched-format-files';
import { StandaloneEslintPluginGeneratorSchema as Schema } from './schema';

export default async function (tree: Tree, options: Schema) {
  const normalizedOptions = normalizeOptions(tree, options, false);

  await createEslintPlugin(tree, { ...normalizedOptions, skipFormat: true });

  if (!normalizedOptions.skipFormat) {
    await formatFiles(tree);
  }
}
