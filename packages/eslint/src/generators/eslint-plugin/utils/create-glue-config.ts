import { joinPathFragments, Tree } from '@nrwl/devkit';
import { NormalizedSchema } from './normalized-schema';
import { updateGlueConfig } from '../../utils/update-glue-config';
import { addPluginToESLintConfiguration } from '../../utils/add-plugin-to-eslint-configuration';

export function createGlueConfig(tree: Tree, options: NormalizedSchema): void {
  updateGlueConfig(tree, {
    plugin: options.sourceRoot,
    tsconfig: joinPathFragments(options.projectRoot, 'tsconfig.lint.json'),
    projectName: options.projectName,
  });

  // const gluePluginName = '@bitovi/glue';// TODO: publish to bitovi
  const gluePluginName = 'glue';

  if (options.rootEslintConfig) {
    addPluginToESLintConfiguration(tree, gluePluginName, options.rootEslintConfig);
  } else {
    addPluginToESLintConfiguration(tree, gluePluginName, joinPathFragments(options.projectRoot, '.eslintrc.json'));
  }
}
