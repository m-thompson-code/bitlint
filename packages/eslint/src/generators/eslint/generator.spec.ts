import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration, updateJson, readJson } from '@nrwl/devkit';

import generator from './generator';
import { EslintGeneratorSchema } from './schema';

describe('eslint generator', () => {
  let appTree: Tree;
  const options: EslintGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
  });
  it('should add dependencies into `package.json` file', async () => {
    const existingDependency = 'existingDependency';
    const existingDependencyVersion = '1.0.0';

    updateJson(appTree, 'package.json', (json) => {
      json.dependencies[existingDependency] = existingDependencyVersion;
      json.devDependencies[existingDependency] = existingDependencyVersion;

      return json;
    });

    await generator(appTree, options);
    const packageJson = readJson(appTree, 'package.json');

    expect(packageJson.devDependencies['@bitovi/eslint']).toBe('^1.0.0');
    expect(packageJson.devDependencies['@bitovi/eslint-plugin-nx-glue']).toBe('^1.0.0');
    expect(packageJson.devDependencies[existingDependency]).toBe(existingDependencyVersion);

    expect(packageJson.dependencies['@bitovi/eslint']).toBeUndefined();
    expect(packageJson.dependencies['@bitovi/eslint-plugin-nx-glue']).toBeUndefined();
    expect(packageJson.dependencies[existingDependency]).toBe(existingDependencyVersion);
  });
});
