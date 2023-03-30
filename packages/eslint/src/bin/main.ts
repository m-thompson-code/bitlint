// import { commandsObject } from 'nx/src/command-line/nx-commands';
// import { logger } from 'nx/src/utils/logger';

// const oldInfo = logger.info;
// logger.info = function (...args) {
//   const message = args[0];

//   if (message.startsWith('NX Generating')) {
//     return logger.info('NX did some stuff with the power of NX ~moo~ :D');
//   }

//   return oldInfo(...args);
// };

// export function main() {
//   try {
//     const args = getParsableArgs(process.argv.slice(2));
//     commandsObject.parse(args);
//   } catch (e) {
//     logError(e);
//     process.exit(1);
//   }
// }

// function getParsableArgs(args: string[]): string[] {
//   const command = args[0];

//   switch (command) {
//     case 'rule':
//       // return ['g', 'nx-eslint-temp:standalone-rule', args.slice(1)];
//       return ['g', 'nx-eslint-temp:rule', ...args.slice(1)];
//     case 'plugin':
//       return ['g', 'nx-eslint-temp:standalone-eslint-plugin', ...args.slice(1)];
//     case 'eslint-plugin':
//       return ['g', 'nx-eslint-temp:standalone-eslint-plugin', ...args.slice(1)];
//     default:
//       throw new Error('Unexpected command');
//   }
// }

// function logError(error: unknown): void {
//   if (error instanceof Error) {
//       console.error(error.message);
//     }
//     console.error(error);
// }
