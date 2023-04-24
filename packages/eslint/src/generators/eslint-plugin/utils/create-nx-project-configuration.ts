import { Tree, addProjectConfiguration, joinPathFragments } from "@nrwl/devkit";
import { NormalizedSchema } from "./normalized-schema";

export function createNxProjectConfiguration(tree: Tree, options: NormalizedSchema): void {
  addProjectConfiguration(tree, options.projectName, {
    root: options.projectRoot,
    projectType: 'library',
    sourceRoot: options.sourceRoot,
    targets: {
      build: getBuildTarget(options),
      lint: getLintTarget(options),
      test: getTestTarget(options),
      doc: getDocTarget(options),
    },
    tags: options.parsedTags,
  });
}

function getBuildTarget(options: NormalizedSchema) {
  return {
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
  };
}

function getLintTarget(options: NormalizedSchema) {
  return {
    executor: '@nrwl/linter:eslint',
    outputs: ['{options.outputFile}'],
    options: {
      lintFilePatterns: [
        joinPathFragments(options.projectRoot, '**/*.ts'),
      ],
    },
  };
}

function getTestTarget(options: NormalizedSchema) {
  return {
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
  };
}

function getDocTarget(options: NormalizedSchema) {
  return {
    executor: '@bitovi/eslint:doc',
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
  };
}
