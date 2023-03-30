import {
  formatFiles,
  Tree,
} from '@nrwl/devkit';
import { normalizeOptions } from '../eslint-plugin/utils/normalized-schema';
import { createEslintPlugin } from '../eslint-plugin/utils/create-eslint-plugin';
import { StandaloneEslintPluginGeneratorSchema as Schema } from './schema';

export default async function (tree: Tree, options: Schema) {
  const normalizedOptions = normalizeOptions(tree, options);

  await createEslintPlugin(tree, normalizedOptions);

  if (!normalizedOptions.skipFormat) {
    await formatFiles(tree);
  }
}
