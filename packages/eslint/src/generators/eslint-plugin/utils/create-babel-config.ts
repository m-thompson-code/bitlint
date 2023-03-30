import { generateFiles, Tree } from "@nrwl/devkit";
import { join } from "path";
import { NormalizedSchema } from "../normalized-schema";

export function createBabelConfig(tree: Tree, options: NormalizedSchema): void {
  generateFiles(
    tree,
    join(__dirname, '../files/babel-template'),
    options.projectRoot,
    {
      template: '',
    }
  );
}
