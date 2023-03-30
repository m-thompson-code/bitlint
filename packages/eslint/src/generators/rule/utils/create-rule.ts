import { applyChangesToString, ChangeType, generateFiles, joinPathFragments, names, Tree } from "@nrwl/devkit";
import { getRelativePath } from "../../../utils/get-relative-path";
import { updateContentOfObjectLiteralExpression } from "../../utils/update-content-of-object-literal-expression";
import { ensureRulesExport } from "./ensure-rules-exports";
import { findRulesObjectLiteralExpression } from "./find-rules-object-literal-expression";
import { NormalizedSchema } from "./normalized-schema";

export function createRule(tree: Tree, options: NormalizedSchema) {
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
    joinPathFragments(options.sourceRoot, options.directory),
    templateOptions
  );

  const indexPath = joinPathFragments(options.sourceRoot, 'index.ts');

  const original = tree.read(indexPath, 'utf-8') ?? '';

  const contentWithRulesExport = ensureRulesExport(indexPath, original);

  const importPath = getRelativePath('', joinPathFragments(options.directory, fileName, fileName));

  const contentWithImports = applyChangesToString(contentWithRulesExport, [
    {
      type: ChangeType.Insert,
      index: 0,
      text: `import { RULE_NAME as ${ruleNameSymbol}, rule as ${propertyName} } from '${importPath}';\n`,
    },
  ]);

  tree.write(indexPath, contentWithImports);

  const updatedExportsChange = updateContentOfObjectLiteralExpression(
    tree,
    indexPath,
    findRulesObjectLiteralExpression,
    `[${ruleNameSymbol}]: ${propertyName}`
  );

  tree.write(indexPath, updatedExportsChange);
}
