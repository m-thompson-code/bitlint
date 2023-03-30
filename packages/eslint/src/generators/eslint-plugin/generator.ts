import {
  addProjectConfiguration,
  formatFiles,
  joinPathFragments,
  Tree,
} from '@nrwl/devkit';
import { EslintPluginGeneratorSchema as Schema } from './schema';
import ruleGenerator from '../rule/generator';
import init from '../init/generator';
import { NormalizedSchema, normalizeOptions } from './utils/normalized-schema';
import { createBabelConfig } from './utils/create-babel-config';
import { createEslintConfig } from './utils/create-eslint-config';

function createNxProjectConfiguration(tree: Tree, options: NormalizedSchema): void {
  addProjectConfiguration(tree, options.projectName, {
    root: options.projectRoot,
    projectType: 'library',
    sourceRoot: options.sourceRoot,
    targets: {
      build: {
        executor: '@nrwl/js:tsc',
        outputs: ['{options.outputPath}'],
        options: {
          outputPath: joinPathFragments('dist', options.projectRoot),
          tsConfig: joinPathFragments(
            options.projectRoot,
            'tsconfig.lint.json'
          ),
          packageJson: joinPathFragments(
            options.projectRoot,
            'package.json'
          ),
          main: joinPathFragments(options.sourceRoot, 'index.ts'),
          assets: [joinPathFragments(options.projectRoot, '*.md')],
        },
      },
      lint: {
        executor: '@nrwl/linter:eslint',
        outputs: ['{options.outputFile}'],
        options: {
          lintFilePatterns: [
            joinPathFragments(options.projectRoot, '**/*.ts'),
          ],
        },
      },
      test: {
        executor: '@nrwl/jest:jest',
        outputs: ['{workspaceRoot}/coverage/{projectRoot}'],
        options: {
          jestConfig: joinPathFragments(
            options.projectRoot,
            'jest.config.ts'
          ),
          passWithNoTests: true,
        },
        configurations: {
          ci: {
            ci: true,
            codeCoverage: true,
          },
        },
      },
      doc: {
        executor: '@bitovi/eslint:doc-gen',
        inputs: ['!{projectRoot}/src/**/*.md', 'default', '^production'],
        // TODO: update cache settings for this executor
        // TODO: inputs: ['!{projectRoot}/src/docs/**/*', 'default', '^production'],
        outputs: ['{options.outputPath}'],
        options: {
          inputPath: joinPathFragments(options.sourceRoot, 'rules'),
          outputPath: joinPathFragments(options.sourceRoot, 'docs'),
          tsconfigPath: joinPathFragments(
            options.projectRoot,
            'tsconfig.lint.json'
          ),
        },
      },
    },
    tags: options.parsedTags,
  });
}

export default async function (
  tree: Tree,
  options: Schema
) {
  const normalizedOptions = normalizeOptions(tree, options);

  if (!normalizedOptions.skipDependencies) {
    await init(tree, { ...normalizedOptions, skipFormat: true });
  }
  if (!normalizedOptions.skipNxProject) {
    createNxProjectConfiguration(tree, normalizedOptions);
    createBabelConfig(tree, normalizedOptions);
  }

  if (normalizedOptions.skipPlaceholderRule) {
    await ruleGenerator(tree, {
      projectName: normalizedOptions.projectName,
      ruleName: 'my-rule',
      skipDependencies: true,
      skipFormat: true,
    });
  }

  await createEslintConfig(tree, { ...normalizedOptions, skipFormat: true });

  if (normalizedOptions.skipFormat) {
    await formatFiles(tree);
  }
}
