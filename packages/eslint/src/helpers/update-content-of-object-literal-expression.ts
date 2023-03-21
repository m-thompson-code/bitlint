import { applyChangesToString, ChangeType, Tree } from "@nrwl/devkit";
import * as ts from 'typescript';

export function updateContentOfObjectLiteralExpression(
  tree: Tree,
  filePath: string,
  finder: (node: ts.Node) => ts.ObjectLiteralExpression | undefined,
  insertedContent: string
): string {
  /**
   * Import the new rule into the workspace plugin index.ts and
   * register it ready for use in .eslintrc.json configs.
   */
  const content = tree.read(filePath, 'utf-8');

  if (!content) {
    return '';
  }

  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const node = sourceFile.forEachChild((node) => finder(node));

  if (!node) {
    // failed to find node, so return existing text as is
    return content;
  }

  /**
   * If the rules object already has entries, we need to make sure our insertion
   * takes commas into account.
   */
  let leadingComma = '';
  if (node.properties.length > 0) {
    if (!node.properties.hasTrailingComma) {
      leadingComma = ',';
    }
  }

  const newContents = applyChangesToString(content, [
    {
      type: ChangeType.Insert,
      index: node.getEnd() - 1,
      text: `${leadingComma}${insertedContent}\n`,
    },
  ]);

  return newContents;
}
