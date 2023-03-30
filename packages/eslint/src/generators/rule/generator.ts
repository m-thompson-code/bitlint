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
import { updateContentOfObjectLiteralExpression } from '../utils/update-content-of-object-literal-expression';
import { RuleGeneratorSchema } from './schema';
import * as ts from 'typescript';
import { getRelativePath } from '../../utils/get-relative-path';

interface NormalizedSchema extends RuleGeneratorSchema {
  directory: string;
  sourceRoot: string;
  projectName: string | undefined;// Required for optional properties used in templates
}

function getSourceRoot(tree: Tree, options: RuleGeneratorSchema): string {
  const { sourceRoot, projectName } = options;

  if (projectName) {
    const projectConfig = readProjectConfiguration(tree, projectName);

    if (projectConfig.sourceRoot) {
      return projectConfig.sourceRoot;
    }
  }

  return sourceRoot ?? '';
}

function normalizeOptions(tree: Tree, options: RuleGeneratorSchema): NormalizedSchema {
  return {
    ...options,
    sourceRoot: getSourceRoot(tree, options),
    directory: options.directory ?? 'rules',
    projectName: options.projectName
  };
}

function addRule(tree: Tree, options: NormalizedSchema) {
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

function ensureRulesExport(filePath: string, content: string): string {
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

export default async function (tree: Tree, options: RuleGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);

  if (!normalizedOptions.skipDependencies) {
    await init(tree, { ...normalizedOptions, skipFormat: true });
  }

  addRule(tree, { ...normalizedOptions });

  if (!normalizedOptions.skipFormat) {
    await formatFiles(tree);
  }
}
