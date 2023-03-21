import {
  formatFiles,
  generateFiles,
  readProjectConfiguration,
  joinPathFragments,
  names,
  Tree,
  ChangeType,
  applyChangesToString,
} from '@nrwl/devkit';
import init from '../init/generator';
import { updateContentOfObjectLiteralExpression } from '../../helpers/update-content-of-object-literal-expression';
import { RuleGeneratorSchema } from './schema';
import * as ts from 'typescript';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface NormalizedSchema extends RuleGeneratorSchema {
  directory: string;
}

function normalizeOptions(tree: Tree, options: RuleGeneratorSchema): NormalizedSchema {

  return {
    ...options,
    directory: options.directory ?? 'rules',
  };
}

function addRule(tree: Tree, options: NormalizedSchema) {
  const projectConfig = readProjectConfiguration(tree, options.projectName);
  const sourceRoot = projectConfig.sourceRoot;

  if (!sourceRoot) {
    throw new Error("Unexpected project configuration is missing sourceRoot");
  }

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
    joinPathFragments(__dirname, 'rules-template'),
    joinPathFragments(sourceRoot, options.directory),
    templateOptions
  );

  const indexPath = joinPathFragments(sourceRoot, 'index.ts');

  const original = tree.read(indexPath, 'utf-8') ?? '';

  const importPath = toRelativePath(joinPathFragments(options.directory, fileName, fileName));

  const contentWithImports = applyChangesToString(original, [
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

function findRulesObjectLiteralExpression(
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

function toRelativePath(path: string): string {
  if (path.startsWith('.')) {
    return path;
  }

  return `./${path}`;
}

export default async function (tree: Tree, options: RuleGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);

  if (!normalizedOptions.skipDependencies) {
    await init(tree, { skipFormat: true });
  }

  addRule(tree, normalizedOptions);

  if (!normalizedOptions.skipFormat) {
    await formatFiles(tree);
  }
}
