import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  offsetFromRoot,
  readProjectConfiguration,
  Tree,
  ChangeType,
  applyChangesToString,
} from '@nrwl/devkit';
import * as ts from 'typescript';
// import { tsquery } from '@phenomnomnominal/tsquery';
// import * as path from 'path';
import { EslintPluginGeneratorSchema } from './schema';
import { libraryGenerator } from '@nrwl/node';

interface NormalizedSchema extends EslintPluginGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  tree: Tree,
  options: EslintPluginGeneratorSchema
): NormalizedSchema {
  const name = names(`eslint-plugin-${options.name}`).fileName;
  const importPath = options.importPath ?? name;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).libsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    name,
    importPath,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };

  // Clean up node generated lib directory
  tree.delete(joinPathFragments(options.projectRoot, 'src/lib'));

  updateGlueConfig(tree, options);
  generateFiles(
    tree,
    joinPathFragments(__dirname, 'index-template'),
    options.projectRoot,
    templateOptions
  );
  addRule(tree, options, 'my-rule');
}

function updateGlueConfig(tree: Tree, options: NormalizedSchema) {
  const configPath = 'eslint-plugin-glue.config.js';
  if (!tree.exists(configPath)) {
    tree.write(configPath, 'module.exports = {};');
  }

  const content = getAppendedContentToObjectLiteralExpression(
    tree,
    configPath,
    findModuleExports,
    `
  '${options.name}': {
    dir: '${options.projectRoot}',
    tsconfig: 'tsconfig.lib.json',
  },
  `
  );

  tree.write(configPath, content);
}

function addRule(tree: Tree, options: NormalizedSchema, ruleName: string) {
  const { fileName, propertyName } = names(ruleName);
  const ruleNameSymbol = `${propertyName}Name`;

  const templateOptions = {
    ...options,
    fileName, propertyName,
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
    ruleNameSymbol,
  };

  generateFiles(
    tree,
    joinPathFragments(__dirname, 'rules-template'),
    options.projectRoot,
    templateOptions
  );

  const indexPath = joinPathFragments(options.projectRoot, 'src', 'index.ts');

  const original = tree.read(indexPath, 'utf-8') ?? '';

  const contentWithImports = applyChangesToString(original, [
    {
      type: ChangeType.Insert,
      index: 0,
      text: `import { RULE_NAME as ${ruleNameSymbol}, rule as ${propertyName} } from './${
        options.directory ? `${options.directory}/` : 'rules/'
      }${fileName}';\n`,
    },
  ]);

  tree.write(indexPath, contentWithImports);

  const updatedExportsChange = getAppendedContentToObjectLiteralExpression(
    tree,
    indexPath,
    findRulesObjectLiteralExpression,
    `[${ruleNameSymbol}]: ${propertyName}`
  );

  tree.write(indexPath, updatedExportsChange);
}

function findModuleExports(
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

function getAppendedContentToObjectLiteralExpression(
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

export default async function (
  tree: Tree,
  options: EslintPluginGeneratorSchema
) {
  console.log(options);

  // await formatFiles(tree);
  // name: string;// eslint-plugin-${name}
  // options.linter = options.linter ?? true;
  // options.buildable = options.buildable ?? true;
  // options.publishable = options.publishable ?? true;
  // options.testEnvironment = options.testEnvironment ?? 'node';
  // options.strict = options.strict ?? true;

  const normalizedOptions = normalizeOptions(tree, options);

  await libraryGenerator(tree, normalizedOptions);

  addFiles(tree, normalizedOptions);

  await formatFiles(tree);
}
