import {
  formatFiles,
  Tree,
} from '@nrwl/devkit';
import { createRule } from '../rule/utils/create-rule';
import { normalizeOptions } from '../rule/utils/normalized-schema';
import { StandaloneRuleGeneratorSchema as Schema } from './schema';

export default async function (tree: Tree, options: Schema) {
  const normalizedOptions = normalizeOptions(tree, options);

  createRule(tree, { ...normalizedOptions });

  if (!normalizedOptions.skipFormat) {
    await formatFiles(tree);
  }
}
