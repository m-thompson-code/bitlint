import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

import generator from './generator';
import { EslintPluginGeneratorSchema } from './schema';

describe('eslint-plugin generator', () => {
  let appTree: Tree;
  const options: EslintPluginGeneratorSchema = { name: 'test', compiler: 'tsc' };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({layout: 'apps-libs'});
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, `eslint-plugin-${options.name}`);
    expect(config).toBeDefined();
  });
});
