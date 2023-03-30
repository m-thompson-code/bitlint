import { getWorkspaceLayout, names, offsetFromRoot, Tree } from '@nrwl/devkit';
import { getEslintPluginName } from '../../utils/get-eslint-plugin-name';
import { EslintPluginGeneratorSchema as Schema } from './schema';

export interface NormalizedSchema extends Schema {
  eslintPluginName: string;
  skipDependencies: boolean;
  offsetFromRoot: string;
  skipNxProject: boolean;
  skipPlaceholderRule: boolean;
  //
  projectName: string;
  projectRoot: string;
  sourceRoot: string;
  // projectDirectory: string;
  parsedTags: string[];
}

function getNxProjectDefaultOptions(options: NormalizedSchema): NormalizedSchema {
  return {
    ...options,
    jestPreset: options.jestPreset ?? 'jest.preset.js',
    rootEslintConfig: options.rootEslintConfig ?? '.eslintrc.json',
    baseTsConfig: options.baseTsConfig ?? 'tsconfig.base.json',
  };
}

function getProjectRoot(tree: Tree, projectDirectory: string, skipNxProject: boolean) {
  if (skipNxProject) {
    return projectDirectory;
  }

  return `${getWorkspaceLayout(tree).libsDir}/${projectDirectory}`;
}

export function normalizeOptions(
  tree: Tree,
  options: Schema
): NormalizedSchema {
  const skipNxProject = options.skipNxProject ?? false;

  const name = names(options.name).fileName;

  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectRoot = getProjectRoot(tree, projectDirectory, skipNxProject);
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');

  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  const normalizedOptions = {
    ...options,
    eslintPluginName: getEslintPluginName(projectName),
    skipDependencies: options.skipDependencies ?? false,
    skipNxProject,
    skipPlaceholderRule: options.skipDependencies ?? false,
    projectName,
    projectRoot,
    sourceRoot: `${projectRoot}/src`,
    offsetFromRoot: offsetFromRoot(projectRoot),
    parsedTags,
  };

  if (!skipNxProject) {
    return getNxProjectDefaultOptions(normalizedOptions);
  }

  return normalizedOptions;
}
