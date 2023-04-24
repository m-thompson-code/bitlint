import { applyChangesToString, ChangeType, generateFiles, joinPathFragments, names, Tree } from "@nrwl/devkit";
import { getRelativePath } from "../../../utils/get-relative-path";
import { updateContentOfObjectLiteralExpression } from "../../utils/update-content-of-object-literal-expression";
import { ensureRulesExport } from "./ensure-rules-exports";
import { findRulesObjectLiteralExpression } from "./find-rules-object-literal-expression";
import { dirname } from "path";

interface CreateRulesOptions {
  ruleName: string;
  directory: string;
  index: string;
  projectName: string | null;
}

export function createRule(tree: Tree, options: CreateRulesOptions) {
  const { fileName, propertyName } = names(options.ruleName);
  const ruleNameSymbol = `${propertyName}Name`;

  const templateOptions = {
    ...options,
    fileName, propertyName,
    template: '',
    ruleNameSymbol,
  };

  generateFiles(
    tree,
    joinPathFragments(__dirname, '../files/rules-template'),
    options.directory,
    templateOptions
  );

  const original = readIndex(tree, options.index);// tree.read(options.index, 'utf-8') ?? '';

  const contentWithRulesExport = ensureRulesExport(options.index, original);

  const importPath = getRelativePath(dirname(options.index), joinPathFragments(options.directory, fileName, fileName));

  const contentWithImports = applyChangesToString(contentWithRulesExport, [
    {
      type: ChangeType.Insert,
      index: 0,
      text: `import { RULE_NAME as ${ruleNameSymbol}, rule as ${propertyName} } from '${importPath}';\n`,
    },
  ]);

  tree.write(options.index, contentWithImports);

  const updatedExportsChange = updateContentOfObjectLiteralExpression(
    tree,
    options.index,
    findRulesObjectLiteralExpression,
    `[${ruleNameSymbol}]: ${propertyName}`
  );

  tree.write(options.index, updatedExportsChange);
}

function readIndex(tree: Tree, path: string): string {
  if (!tree.exists(path)) {
    return '';
  }

  return tree.read(path, 'utf-8') ?? '';
}
