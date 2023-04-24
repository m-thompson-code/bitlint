import {
  Tree,
} from '@nrwl/devkit';
import { createRule } from '../rule/utils/create-rule';
import { normalizeOptions } from './utils/normalized-schema';
import { formatFiles } from '../utils/patched-format-files';
import { StandaloneRuleGeneratorSchema as Schema } from './schema';

export default async function (tree: Tree, options: Schema) {
  const normalizedOptions = normalizeOptions(tree, options);

  createRule(tree, { ...normalizedOptions, projectName: null });

  if (!normalizedOptions.skipFormat) {
    await formatFiles(tree);
  }
}
