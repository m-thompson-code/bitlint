import { generateFiles, names, Tree } from "@nrwl/devkit";
import { join } from "path";
import { NormalizedSchema } from "./normalized-schema";

export function createCoreFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.projectName),
    template: '',
  };
  generateFiles(
    tree,
    join(__dirname, '../files/index-template'),
    options.sourceRoot,
    templateOptions
  );
  generateFiles(
    tree,
    join(__dirname, '../files/core-template'),
    // Only add README.md and package.json to root if
    // not the root of the project
    options.projectRoot || options.sourceRoot,
    templateOptions
  );
}
