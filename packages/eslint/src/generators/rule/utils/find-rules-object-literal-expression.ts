import * as ts from 'typescript';

export function findRulesObjectLiteralExpression(
  node: ts.Node
): ts.ObjectLiteralExpression | undefined {
  if (
    ts.isPropertyAssignment(node) &&
    ts.isIdentifier(node.name) &&
    node.name.text === 'rules' &&
    ts.isObjectLiteralExpression(node.initializer)
  ) {
    return node.initializer;
  }

  return node.forEachChild(findRulesObjectLiteralExpression);
}
