import { applyChangesToString, ChangeType } from "@nrwl/devkit";
import * as ts from 'typescript';
import { findRulesObjectLiteralExpression } from "./find-rules-object-literal-expression";

export function ensureRulesExport(filePath: string, content: string): string {
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const rulesExport = sourceFile.forEachChild((node) => findRulesObjectLiteralExpression(node));

  if (rulesExport) {
    return content;
  }

  return applyChangesToString(content, [
    {
      type: ChangeType.Insert,
      index: content.length,
      text: `\nmodule.exports = { rules: {} };\n`,
    },
  ]);
}
