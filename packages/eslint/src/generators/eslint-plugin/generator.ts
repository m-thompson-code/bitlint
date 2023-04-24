import {
  formatFiles,
  Tree,
} from '@nrwl/devkit';
import { EslintPluginGeneratorSchema as Schema } from './schema';
import init from '../init/generator';
import { normalizeOptions } from './utils/normalized-schema';
import { createBabelConfig } from './utils/create-babel-config';
import { createEslintConfig } from './utils/create-eslint-config';
import { createEslintPlugin } from './utils/create-eslint-plugin';
import { createNxProjectConfiguration } from './utils/create-nx-project-configuration';

export default async function (
  tree: Tree,
  options: Schema
) {
  const normalizedOptions = normalizeOptions(tree, options, true);

  if (!normalizedOptions.skipDependencies) {
    await init(tree, { ...normalizedOptions, skipFormat: true });
  }

  createNxProjectConfiguration(tree, { ...normalizedOptions, skipFormat: true });
  createBabelConfig(tree, { ...normalizedOptions, skipFormat: true });

  await createEslintConfig(tree, { ...normalizedOptions, skipFormat: true });

  await createEslintPlugin(tree, normalizedOptions);

  if (!normalizedOptions.skipFormat) {
    await formatFiles(tree);
  }
}
