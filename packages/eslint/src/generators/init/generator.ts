import {
  addDependenciesToPackageJson,
  formatFiles,
  GeneratorCallback,
  removeDependenciesFromPackageJson,
  Tree,
} from '@nrwl/devkit';

import { getNxVersion } from '../../helpers/get-nx-version';
import { initGenerator } from '@nrwl/node';
import { lintInitGenerator } from '@nrwl/linter';
import { InitGeneratorSchema as Schema } from './schema';

function updateDependencies(host: Tree) {
  removeDependenciesFromPackageJson(
    host,
    [
      '@nrwl/linter',
      '@nrwl/node',
      '@angular-eslint/utils',
      '@bitovi/eslint',
      '@bitovi/eslint-plugin-nx-glue',
    ],
    []
  );

  return addDependenciesToPackageJson(
    host,
    {},
    {
      ['@nrwl/linter']: getNxVersion(),
      ['@nrwl/node']: getNxVersion(),
      ['@angular-eslint/utils']: '~15.0.0',
      ['@bitovi/eslint']: '^1.0.0',
      ['@bitovi/eslint-plugin-nx-glue']: '^1.0.0',
    }
  );
}

export default async function (tree: Tree, options: Schema) {
  const tasks: GeneratorCallback[] = [];

  tasks.push(
    await initGenerator(tree, {
      ...options,
      unitTestRunner: 'jest',
      skipFormat: true,
    })
  );

  tasks.push(await lintInitGenerator(tree, { ...options }));

  if (!options.skipPackageJson) {
    tasks.push(await updateDependencies(tree));
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
}

/**
 * Run tasks in serial
 *
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
