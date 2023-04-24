import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readJson, updateJson } from '@nrwl/devkit';

import generator from './generator';

describe('init generator', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({layout: 'apps-libs'});
  });

  it('should add dependencies into `package.json` file', async () => {
    const existingDependency = 'existingDependency';
    const existingDependencyVersion = '1.0.0';

    updateJson(appTree, 'package.json', (json) => {
      json.dependencies[existingDependency] = existingDependencyVersion;
      json.devDependencies[existingDependency] = existingDependencyVersion;

      return json;
    });

    await generator(appTree, {});
    const packageJson = readJson(appTree, 'package.json');

    // expect(packageJson.devDependencies['@bitovi/eslint']).toBe('^1.0.0');
    // expect(packageJson.devDependencies['@bitovi/eslint-plugin-glue']).toBe('^1.0.0');
    expect(packageJson.devDependencies['eslint-plugin-glue']).toBe('^0.3.0');
    expect(packageJson.devDependencies[existingDependency]).toBe(existingDependencyVersion);

    // expect(packageJson.dependencies['@bitovi/eslint']).toBeUndefined();
    // expect(packageJson.dependencies['@bitovi/eslint-plugin-glue']).toBeUndefined();
    expect(packageJson.dependencies['eslint-plugin-glue']).toBeUndefined();
    expect(packageJson.dependencies[existingDependency]).toBe(existingDependencyVersion);
  });
});
