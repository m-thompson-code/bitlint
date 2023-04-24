import { Tree } from "@nrwl/devkit";
import { StandaloneRuleGeneratorSchema as Schema } from "../schema";

export interface NormalizedSchema extends Schema {
  directory: string;
  index: string;
}

export function normalizeOptions(tree: Tree, options: Schema): NormalizedSchema {
  const index = options.index ?? 'index.ts';
  const directory = options.directory ?? 'rules';

  return {
    ...options,
    index,
    directory,
  };
}
