import { logger, workspaceRoot } from '@nrwl/devkit';
import { join } from 'path';
import * as yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { generateDocs } from '../generate-docs';
import { getErrorMessage } from '../utils/get-error-message';
import { getGeneratorOptions } from './get-generator-options';
import { getInfoOverride } from './logger-info';
import { getGeneratorHandler } from './get-generator-handler';
import { DocOptions, getDocOptions } from './get-doc-options';

logger.info = getInfoOverride(logger.info);

export const parserConfiguration: Partial<yargs.ParserConfigurationOptions> = {
  'strip-dashed': true,
};

export function main() {
  try {
    // Ensure that the output takes up the available width of the terminal.
    yargs.wrap(yargs.terminalWidth());

    // Remove node paths from argv
    const args = hideBin(process.argv);

    yargs(args)
      .parserConfiguration(parserConfiguration)
      .demandCommand(1, '')
      .command({
        command: 'init [_..]',
        describe: 'Installs dependencies',
        aliases: ['i'],
        builder: (yargs) =>
          getGeneratorOptions(
            yargs,
            '../generators/standalone-init/schema.json'
          ),
        handler: getGeneratorHandler('nx-eslint-temp:standalone-init'),
      })
      .command({
        command: 'doc [_..]',
        describe: 'Generate docs',
        aliases: ['d'],
        builder: (yargs) => getDocOptions(yargs),
        handler: async (argv) => {
          console.log('doc -> argv', args);

          const { input, output, tsconfig, verbose } =
            argv as yargs.ArgumentsCamelCase<DocOptions>;

          await generateDocs(
            join(workspaceRoot, input),
            output === '<input>/docs'
              ? join(workspaceRoot, input, 'docs')
              : join(workspaceRoot, output),
            tsconfig ? join(workspaceRoot, tsconfig) : undefined,
            verbose
          );
        },
      })
      .command({
        command: 'rule [ruleName] [_..]',
        describe: 'Generate rules',
        aliases: ['r'],
        builder: (yargs) =>
          getGeneratorOptions(
            yargs,
            '../generators/standalone-rule/schema.json',
            'ruleName'
          ),
        handler: getGeneratorHandler('nx-eslint-temp:standalone-rule'),
      })
      .command({
        command: 'plugin [pluginName] [_..]',
        describe: 'Generate plugin',
        aliases: ['p'],
        builder: (yargs) =>
          getGeneratorOptions(
            yargs,
            '../generators/standalone-eslint-plugin/schema.json',
            'pluginName'
          ),
        handler: getGeneratorHandler('nx-eslint-temp:standalone-eslint-plugin'),
      })
      .scriptName('bitlint')
      .parse();
  } catch (e) {
    console.error(getErrorMessage(e));
    process.exit(1);
  }
}
