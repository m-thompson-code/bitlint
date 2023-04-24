import * as yargs from 'yargs';
import { removeUndefinedProperties } from '../utils/remove-undefined-properties';

export function getGeneratorHandler(nxGenerator: string) {
  return async function (argv: yargs.ArgumentsCamelCase<unknown>) {
    // Remove the command from the args
    argv._ = argv._.slice(1);
    argv.generator = nxGenerator;

    removeUndefinedProperties(argv);

    console.log(nxGenerator, argv);

    process.exit(
      await (
        await import('nx/src/command-line/generate')
      ).generate(process.cwd(), argv)
    );
  };
}
