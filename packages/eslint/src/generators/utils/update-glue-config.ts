import { Tree } from "@nrwl/devkit";
import { updateContentOfObjectLiteralExpression } from "./update-content-of-object-literal-expression";
import { findModuleExports } from "./find-module-exports";

interface GlueConfigOptions {
  projectName: string;
  tsconfig: string;
  plugin: string;
}

export function updateGlueConfig(tree: Tree, options: GlueConfigOptions) {

  const configPath = 'eslint-plugin-glue.config.js';
  if (!tree.exists(configPath)) {
    tree.write(configPath, 'module.exports = {};');
  }

  const content = updateContentOfObjectLiteralExpression(
    tree,
    configPath,
    findModuleExports,
    `
  '${options.projectName}': {
    plugin: '${options.plugin}',
    tsconfig: '${options.tsconfig}',
  },
  `
  );

  tree.write(configPath, content);
}
