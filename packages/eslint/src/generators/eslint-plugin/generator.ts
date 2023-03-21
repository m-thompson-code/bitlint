import {
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  offsetFromRoot,
  Tree,
  updateJson,
} from '@nrwl/devkit';
import * as ts from 'typescript';
import { EslintPluginGeneratorSchema } from './schema';
import { libraryGenerator } from '@nrwl/node';
import { updateContentOfObjectLiteralExpression } from '../../helpers/update-content-of-object-literal-expression';
import init from '../init/generator';
import ruleGenerator from '../rule/generator';
import { addPluginToEslint } from '../../helpers/add-plugin-to-eslint-config';

interface NormalizedSchema extends EslintPluginGeneratorSchema {
  eslintPluginName: string;
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  tree: Tree,
  options: EslintPluginGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const eslintPluginName = getEslintPluginName(name);
  const importPath = getEslintPluginName(options.importPath ?? name);
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
    eslintPluginName,
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
  updatePackageJson(tree, options);
  addPluginToEslint(tree, '@bitovi/nx-glue');

  generateFiles(
    tree,
    joinPathFragments(__dirname, 'index-template'),
    options.projectRoot,
    templateOptions
  );
}

function updatePackageJson(tree: Tree, options: NormalizedSchema): void {
  const path = joinPathFragments(options.projectRoot, 'package.json');
  if (!tree.exists(path)) {
    return;
  }

  updateJson(tree, path, (json) => ({
    ...json,
    // main: './src/index.js',// already included by default
    // "types": "./src/index.d.ts"// already included by default
    peerDependencies: {
      eslint: ">=8",
    },
  }));
}

function updateGlueConfig(tree: Tree, options: NormalizedSchema) {
  const configPath = 'eslint-plugin-glue.config.js';
  if (!tree.exists(configPath)) {
    tree.write(configPath, 'module.exports = {};');
  }

  const content = updateContentOfObjectLiteralExpression(
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

export default async function (
  tree: Tree,
  options: EslintPluginGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);

  await init(tree, { ...normalizedOptions, skipFormat: true });

  await libraryGenerator(tree, { ...normalizedOptions, skipFormat: true });

  addFiles(tree, normalizedOptions);

  await ruleGenerator(tree, {
    projectName: normalizedOptions.projectName,
    ruleName: 'my-rule',
    skipDependencies: true,
    skipFormat: true
  });

  await formatFiles(tree);
}

function getEslintPluginName(name: string): string {
  const [first, second] = name.split('/');

  if (second) {
    return `${first}/${getEslintPluginName(second)}`;
  }

  if (name.startsWith('eslint-plugin')) {
    return name;
  }

  return `eslint-plugin-${name}`;
}
