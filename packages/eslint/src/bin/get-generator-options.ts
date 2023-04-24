import { readFileSync } from 'fs';
import { join } from 'path';
import * as yargs from 'yargs';

interface GeneratorSchema {
  properties: {
    [option: string]: {
      type: 'string' | 'boolean';
      description: string;
      alias: string;
      default?: boolean;
    }
  },
  required?: string[];
}

function applyNxGeneratorOptions(argv: yargs.Argv<unknown>): yargs.Argv<unknown> {
  return argv.option('dryRun', {
    describe: 'Preview the changes without updating files',
    alias: 'd',
    type: 'boolean',
    default: false,
  })
  .option('interactive', {
    describe: 'When false disables interactive input prompts for options',
    type: 'boolean',
    default: true,
  })
  .option('verbose', {
    describe:
      'Prints additional information about the commands (e.g., stack traces)',
    type: 'boolean',
  })
  .option('quiet', {
    describe: 'Hides logs from tree operations (e.g. `CREATE package.json`)',
    type: 'boolean',
    conflicts: ['verbose'],
  })
}

function readSchema(path: string): GeneratorSchema {
  return JSON.parse(readFileSync(join(__dirname, path), 'utf8')) as GeneratorSchema;
}

export function getGeneratorOptions(argv: yargs.Argv<unknown>, path: string, positional?: string): yargs.Argv<unknown> {
  const schema = readSchema(path);

  return applyNxGeneratorOptions(Object.entries(schema.properties).reduce((previous, [key, property]) => {
    if (key === positional) {
      return previous.positional(key, {
        describe: property.description,
        type: property.type,
        default: property.default,
        demandOption: schema.required?.includes(key)
      });
    }

    return previous.option(key, {
        describe: property.description,
        type: property.type,
        default: property.default,
        demandOption: schema.required?.includes(key)
      });
  }, argv));
}
