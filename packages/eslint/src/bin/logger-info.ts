import { logger } from "@nrwl/devkit";

export function getInfoOverride(info: typeof logger.info) {
  return function (...args: Parameters<typeof logger.info>) {
    const message = args[0];

    // TODO: handle strings like 'Generating nx-eslint-temp:standalone-eslint-plugin'
    if (message.startsWith('NX Generating')) {
      return logger.info('NX did some stuff with the power of NX ~moo~ :D');
    }

    return info(...args);
  }
}
