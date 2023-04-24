import { formatFiles, Tree } from '@nrwl/devkit';
import init from '../init/generator';
import { RuleGeneratorSchema as Schema } from './schema';
import { normalizeOptions } from './utils/normalized-schema';
import { createRule } from './utils/create-rule';

export default async function (tree: Tree, options: Schema) {
  const normalizedOptions = normalizeOptions(tree, options);

  if (!normalizedOptions.skipDependencies) {
    await init(tree, { ...normalizedOptions, skipFormat: true });
  }

  createRule(tree, {
    ...normalizedOptions,
  });

  if (!normalizedOptions.skipFormat) {
    await formatFiles(tree);
  }
}
