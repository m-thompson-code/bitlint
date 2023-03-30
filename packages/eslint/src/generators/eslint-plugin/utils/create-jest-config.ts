import { joinPathFragments, Tree } from '@nrwl/devkit';
import * as nxPreset from '@nrwl/jest/preset';
import type { Config } from 'jest';
import { getRelativePath } from '../../../utils/get-relative-path';
import { NormalizedSchema } from '../normalized-schema';

interface JestConfigOptions {
  displayName: string;
  coverageDirectory: string;
}

interface JestPresetConfigOptions extends JestConfigOptions {
  preset: string;
}

export function createJestConfig(tree: Tree, options: NormalizedSchema): void {
  // TODO: check for jest.config.js too
  const path = joinPathFragments(options.projectRoot, 'jest.config.ts');

  // Avoid creating jest config since one already exists
  if (tree.exists(path)) {
    return;
  }

  tree.write(
    path,
    `/* eslint-disable */\nexport default ${JSON.stringify(
      getConfig(options),
      null,
      2
    )}\n`
  );
}

function getConfig(options: NormalizedSchema) {
  const coverageDirectory = getRelativePath(
    options.projectRoot,
    joinPathFragments('coverage', options.projectRoot)
  );

  if (options.jestPreset) {
    return getPresetConfig({
      displayName: options.projectName,
      preset: getRelativePath(options.projectRoot, options.jestPreset),
      coverageDirectory,
    });
  }

  return getRootConfig({
    displayName: options.projectName,
    coverageDirectory,
  });
}

function getPresetConfig(options: JestPresetConfigOptions): Config {
  return getBaseConfig(options, {
    preset: options.preset,
  });
}

function getRootConfig(options: JestConfigOptions): Config {
  const { ...rest } = nxPreset as Config;

  if ('displayName' in rest) {
    delete rest.displayName;
  }

  return getBaseConfig(options, rest);
}

function getBaseConfig(options: JestConfigOptions, config: Config): Config {
  return {
    displayName: options.displayName,
    ...config,
    testEnvironment: 'node',
    transform: {
      '^.+\\.[tj]sx?$': [
        'ts-jest',
        { tsconfig: '<rootDir>/tsconfig.spec.json' },
      ],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: options.coverageDirectory,
  };
}
