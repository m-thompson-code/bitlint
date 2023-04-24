import { readProjectConfiguration, Tree } from "@nrwl/devkit";
import { join } from "path";
import { RuleGeneratorSchema } from "../schema";

export interface NormalizedSchema extends RuleGeneratorSchema {
  directory: string;
  index: string;
  projectName: string;
}

export function normalizeOptions(tree: Tree, options: RuleGeneratorSchema): NormalizedSchema {
  const projectConfig = readProjectConfiguration(tree, options.projectName);

  const sourceRoot = projectConfig.sourceRoot ?? '';

  const index = options.index ?? 'index.ts';
  const directory = options.directory ?? 'rules';

  return {
    ...options,
    index: join(sourceRoot, index),
    directory: join(sourceRoot, directory),
    projectName: options.projectName,
  };
}
