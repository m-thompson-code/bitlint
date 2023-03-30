import { joinPathFragments, Tree } from '@nrwl/devkit';
import { NormalizedSchema } from '../normalized-schema';
import { updateGlueConfig } from '../../utils/update-glue-config';
import { addPluginToJson } from '../../utils/add-plugin-to-eslint-config';

export function createGlueConfig(tree: Tree, options: NormalizedSchema): void {
  updateGlueConfig(tree, {
    dir: options.sourceRoot,
    tsconfig: joinPathFragments(options.projectRoot, 'tsconfig.lint.json'),
    projectName: options.projectName,
  });

  if (options.rootEslintConfig) {
    addPluginToJson(tree, '@bitovi/nx-glue', options.rootEslintConfig);
  } else {
    addPluginToJson(tree, '@bitovi/nx-glue', joinPathFragments(options.projectRoot, '.eslintrc.json'));
  }
}
