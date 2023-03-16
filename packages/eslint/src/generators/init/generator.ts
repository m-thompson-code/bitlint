import {
  addDependenciesToPackageJson,
  removeDependenciesFromPackageJson,
  Tree,
} from '@nrwl/devkit';
import { InitGeneratorSchema as Schema } from './schema';

function updateDependencies(host: Tree) {
  removeDependenciesFromPackageJson(
    host,
    [
      '@angular-eslint/utils',
      '@bitovi/eslint',
      '@bitovi/eslint-plugin-nx-glue'
    ],
    []
  );

  return addDependenciesToPackageJson(
    host,
    {},
    {
      ['@angular-eslint/utils']: '~15.0.0',
      ['@bitovi/eslint']: '^1.0.0',
      ['@bitovi/eslint-plugin-nx-glue']: '^1.0.0'
    }
  );
}

export default function (host: Tree, options: Schema) {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return !options.skipPackageJson ? updateDependencies(host) : () => {};
}
