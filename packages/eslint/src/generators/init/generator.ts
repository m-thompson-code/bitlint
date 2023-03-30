import {
  addDependenciesToPackageJson,
  formatFiles,
  GeneratorCallback,
  removeDependenciesFromPackageJson,
  Tree,
} from '@nrwl/devkit';

import { getNxVersion } from '../../utils/get-nx-version';
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
      // '@bitovi/eslint',
      '@bitovi/eslint-plugin-nx-glue',
      'glob',
    ],
    []
  );

  return addDependenciesToPackageJson(
    host,
    {},
    {
      ['@nrwl/linter']: getNxVersion(),
      ['@nrwl/js']: getNxVersion(),
      ['@nrwl/jest']: getNxVersion(),
      ['@angular-eslint/utils']: '~15.0.0',
      // ['@bitovi/eslint']: '^1.0.0',
      ['@bitovi/eslint-plugin-nx-glue']: '^1.2.0',
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
      // tsConfigName: schema.rootProject ? 'tsconfig.json' : 'tsconfig.base.json',
    })
  );

  // if (options.unitTestRunner === 'jest') {
    tasks.push(
      await jestInitGenerator(tree, { ...options, testEnvironment: 'node' })
    );
  // }

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

// https://stackoverflow.com/questions/13444064/typescript-conditional-module-import-export
// async function importModule(moduleName: string): Promise<any>{
//   console.log("importing ", moduleName);
//   const importedModule = await import(moduleName);
//   console.log("\timported ...");
//   return importedModule;
// }
