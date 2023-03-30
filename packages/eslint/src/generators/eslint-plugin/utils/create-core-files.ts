import { generateFiles, names, Tree } from "@nrwl/devkit";
import { join } from "path";
import { NormalizedSchema } from "./normalized-schema";

export function createCoreFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
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
    join(__dirname, '../files/root-template'),
    options.projectRoot,
    templateOptions
  );
}
