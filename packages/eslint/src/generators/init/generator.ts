import {
  addDependenciesToPackageJson,
  formatFiles,
  GeneratorCallback,
  removeDependenciesFromPackageJson,
  Tree,
  NX_VERSION
} from '@nrwl/devkit';

import { initGenerator } from '@nrwl/js';
import { jestInitGenerator } from '@nrwl/jest';
import { lintInitGenerator } from '@nrwl/linter';
import { InitGeneratorSchema as Schema } from './schema';

function updateDependencies(host: Tree) {
  removeDependenciesFromPackageJson(
    host,
    [
      '@nrwl/linter',
      '@nrwl/js',
      '@nrwl/jest',
      '@angular-eslint/utils',
      // '@bitovi/eslint',// TODO
      // '@bitovi/eslint-plugin-glue',// TODO
      'eslint-plugin-glue',
      'glob',
    ],
    []
  );

  return addDependenciesToPackageJson(
    host,
    {},
    {
      ['@nrwl/linter']: NX_VERSION,
      ['@nrwl/js']: NX_VERSION,
      ['@nrwl/jest']: NX_VERSION,
      ['@angular-eslint/utils']: '~15.0.0',
      // ['@bitovi/eslint']: '^1.0.0',
      // ['@bitovi/eslint-plugin-glue']: '^1.0.0',
      ['eslint-plugin-glue']: '^0.3.0',
      ['glob']: '^9.3.1',
    }
  );
}

export default async function (tree: Tree, options: Schema) {
  const tasks: GeneratorCallback[] = [];

  tasks.push(
    await initGenerator(tree, {
      ...options,
      skipFormat: true,
      tsConfigName: 'tsconfig.base.json'
    })
  );

  tasks.push(
    await jestInitGenerator(tree, { ...options, testEnvironment: 'node' })
  );

  tasks.push(lintInitGenerator(tree, { ...options }));

  if (!options.skipPackageJson) {
    tasks.push(updateDependencies(tree));
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
}

/**
 * Run tasks in serial
 * TODO: link to source code
 * @param tasks The tasks to run in serial.
 */
export function runTasksInSerial(
  ...tasks: GeneratorCallback[]
): GeneratorCallback {
  return async () => {
    for (const task of tasks) {
      await task();
    }
  };
}
