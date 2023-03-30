import { readProjectConfiguration, Tree } from "@nrwl/devkit";
import { RuleGeneratorSchema } from "../schema";

export interface NormalizedSchema extends RuleGeneratorSchema {
  directory: string;
  sourceRoot: string;
  projectName: string | undefined;// Required for optional properties used in templates
}

export function normalizeOptions(tree: Tree, options: RuleGeneratorSchema): NormalizedSchema {
  return {
    ...options,
    sourceRoot: getSourceRoot(tree, options),
    directory: options.directory ?? 'rules',
    projectName: options.projectName
  };
}

function getSourceRoot(tree: Tree, options: RuleGeneratorSchema): string {
  const { sourceRoot, projectName } = options;

  if (projectName) {
    const projectConfig = readProjectConfiguration(tree, projectName);

    if (projectConfig.sourceRoot) {
      return projectConfig.sourceRoot;
    }
  }

  return sourceRoot ?? '';
}
