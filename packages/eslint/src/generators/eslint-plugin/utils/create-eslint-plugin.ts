import { formatFiles, Tree } from "@nrwl/devkit";
import { NormalizedSchema } from "./normalized-schema";
import { createCoreFiles } from "./create-core-files";
import { createEslintConfig } from "./create-eslint-config";
import { createGlueConfig } from "./create-glue-config";
import { createJestConfig } from "./create-jest-config";
import { createTsConfig } from "./create-ts-config";

export async function createEslintPlugin(tree: Tree, options: NormalizedSchema) {
  createJestConfig(tree, options);

  createEslintConfig(tree, options);

  createTsConfig(tree, options);

  createGlueConfig(tree, options);

  createCoreFiles(tree, options);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}
