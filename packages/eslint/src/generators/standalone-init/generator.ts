import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  NX_VERSION,
  offsetFromRoot,
  readRootPackageJson,
  removeDependenciesFromPackageJson,
  Tree,
} from '@nrwl/devkit';
import * as path from 'path';
import { StandaloneInitGeneratorSchema as Schema } from './schema';
import { keys } from '../../utils/keys';

// "nx": "^15.8.6",
// "@nrwl/devkit": "^15.8.6",
// "glob": "^9.3.1",
// "yargs": "^17.6.2",
// "prettier": "^2.6.2",
// "@nrwl/jest": "^15.8.6",
// "ts-node": "^10.9.1",
// "semver": "^7.3.4"

// "@angular-eslint/utils": "~15.0.0",
// "@typescript-eslint/eslint-plugin": "^5.36.1",
// "@typescript-eslint/parser": "^5.36.1",
// "@bitovi/eslint-plugin-glue": "^1.0.0",

// "jest": "^29.4.1",
// "jest-environment-jsdom": "^29.4.1",
// "jest-environment-node": "^29.4.1",

// "ts-jest": "^29.0.5",
// "ts-node": "^10.9.1",

function updateDependencies(tree: Tree) {
  const devDependencies = {
    // Plugin dependency
    // '@bitovi/eslint',
    // eslint rule dependencies
    "eslint": "~8.15.0",
    "@angular-eslint/utils": "~15.0.0",
    "@typescript-eslint/eslint-plugin": "^5.36.1",
    "@typescript-eslint/parser": "^5.36.1",
    // "@bitovi/eslint-plugin-glue": "^1.0.0",// TODO
    "eslint-plugin-glue": "^0.3.0",
    // Jest dependencies
    "jest": "^29.4.1",
    // "jest-environment-jsdom": "^29.4.1",// <-- TODO shouldn't be needed
    "jest-environment-node": "^29.4.1",
    "ts-jest": "^29.0.5",
    "@nrwl/jest": NX_VERSION,
    // Doc generator, Jest, Glue dependency
    "ts-node": "^10.9.1",
    "typescript": "~4.9.5",
  }

  // Clean up dependencies that should be devDependencies
  removeDependenciesFromPackageJson(
    tree,
    keys(devDependencies),
    []
  );

  const packageJson = readRootPackageJson();

  keys(devDependencies).forEach(devDependency => {
    devDependency

    if (packageJson.devDependencies?.[devDependency]) {
      delete devDependencies[devDependency];
    }
  });

  if (!keys(devDependencies).length) {
    return () => {/* noop */};
  }

  return addDependenciesToPackageJson(
    tree,
    {},
    devDependencies
  );
}

export default async function (tree: Tree, options: Schema) {
  if (!options.skipDependencies) {
    const installDependencies = updateDependencies(tree);

    // TODO: consider if dryRun?
    await installDependencies();
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}
