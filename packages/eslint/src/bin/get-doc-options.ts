import * as yargs from 'yargs';

export type DocOptions = {
  input: string;
  output: string;
  tsconfig: string | undefined;
  verbose: boolean;
};

export function getDocOptions(yargs: yargs.Argv): yargs.Argv<DocOptions> {
  return yargs
    .option('input', {
      demandOption: true,
      describe: 'Directory to search for eslint rules and unit tests',
      alias: 'i',
      type: 'string',
    })
    .option('output', {
      describe: 'Output directory for documentation',
      alias: 'o',
      type: 'string',
      default: '<input>/docs',
    })
    .option('tsconfig', {
      describe: 'Used for tsconfig file that parses rules',
      alias: 't',
      type: 'string',
    })
    .option('verbose', {
      describe:
        'Prints additional information about the commands (e.g., stack traces)',
      type: 'boolean',
      default: false,
    });
}
