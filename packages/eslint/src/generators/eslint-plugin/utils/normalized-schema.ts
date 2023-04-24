import { getWorkspaceLayout, names, offsetFromRoot, Tree } from '@nrwl/devkit';
import { getESLintPluginName } from '../../../utils/get-eslint-plugin-name';
import { EslintPluginGeneratorSchema as Schema } from '../schema';

export interface NormalizedSchema extends Schema {
  eslintPluginName: string;
  skipDependencies: boolean;
  offsetFromRoot: string;
  projectName: string;
  projectRoot: string;
  sourceRoot: string;
  parsedTags: string[];
  skipFormat: boolean;
}

function getNxProjectDefaultOptions(options: NormalizedSchema): NormalizedSchema {
  return {
    ...options,
    jestPreset: options.jestPreset ?? 'jest.preset.js',
    rootEslintConfig: options.rootEslintConfig ?? '.eslintrc.json',
    baseTsConfig: options.baseTsConfig ?? 'tsconfig.base.json',
  };
}

function getProjectRoot(tree: Tree, projectName: string, directory: string, isNxProject: boolean) {
  if (isNxProject) {
    const projectDirectory = directory
    ? `${names(directory).fileName}/${projectName}`
    : projectName;

    return `${getWorkspaceLayout(tree).libsDir}/${projectDirectory}`;
  }

  return directory ? names(directory).fileName : '';
}

export function normalizeOptions(
  tree: Tree,
  options: Schema,
  isNxProject: boolean
): NormalizedSchema {
  const projectName = names(options.pluginName).fileName;

  const projectRoot = getProjectRoot(tree, projectName, options.directory ?? '', isNxProject);

  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  const normalizedOptions = {
    ...options,
    eslintPluginName: getESLintPluginName(projectName),
    skipDependencies: options.skipDependencies ?? false,
    projectName,
    projectRoot,
    sourceRoot: `${projectRoot}/src`,
    offsetFromRoot: offsetFromRoot(projectRoot),
    parsedTags,
    skipFormat: options.skipFormat ?? false,
  };

  if (isNxProject) {
    return getNxProjectDefaultOptions(normalizedOptions);
  }

  return normalizedOptions;
}
