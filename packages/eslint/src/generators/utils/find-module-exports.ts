import * as ts from 'typescript';

export function findModuleExports(
  node: ts.Node
): ts.ObjectLiteralExpression | undefined {
  if (!ts.isBinaryExpression(node)) {
    return node.forEachChild(findModuleExports);
  }

  const { left, right } = node;

  if (!ts.isObjectLiteralExpression(right)) {
    return node.forEachChild(findModuleExports);
  }

  if (!ts.isPropertyAccessExpression(left)) {
    return node.forEachChild(findModuleExports);
  }

  const moduleIdentifer = left.expression;

  if (!ts.isIdentifier(moduleIdentifer) || moduleIdentifer.text !== 'module') {
    return node.forEachChild(findModuleExports);
  }

  const exportsIdentifier = left.name;

  if (exportsIdentifier.text !== 'exports') {
    return node.forEachChild(findModuleExports);
  }

  return right;
}
