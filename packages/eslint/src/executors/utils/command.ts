/**
 * source: https://gist.github.com/elliottsj/fff86bc2b64ff68871f09cc0cd517393
 */

import { logger } from '@nrwl/devkit';
import { spawnPromise } from './spawn-promise';
import { ChildProcess, SpawnOptions } from 'child_process';

/**
 * @whatItDoes Initialize the Cypress test runner with the provided project configuration.
 * By default, Cypress will run tests from the CLI without the GUI and provide directly the results in the console output.
 * If `watch` is `true`: Open Cypress in the interactive GUI to interact directly with the application.
 */
export async function command(command: string, env: NodeJS.ProcessEnv = {}): Promise<boolean> {
  // https://github.com/cucumber/cucumber-js/blob/main/docs/installation.md#invalid-installations
  try {
    const [first, ...args] = command;

    await spawnPromise(first, args, getSpawnOptions(getProcessEnv(env)), getSyncStdioFunction(process));

    return true;
  } catch (error) {
    handleError(error);

    return false;
  }
}

function getProcessEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  return {
    // Existing process environment variables
    ...process.env,
    // Preserves the output color in terminal
    FORCE_COLOR: 'true',
    // Schema option environment variables overrides
    ...env,
  };
}

function getSpawnOptions(env: NodeJS.ProcessEnv): SpawnOptions {
  return {
    env,
    shell: true,
    stdio: 'pipe',
  };
}

function getSyncStdioFunction(
  parent: NodeJS.Process
): (child: ChildProcess) => void {
  return (child: ChildProcess) => {
    const { stdout, stderr } = child;

    if (!stdout) {
      logger.warn("stdout not defined for child process. Output won't display");
    } else {
      stdout.pipe(parent.stdout);
    }

    if (!stderr) {
      logger.warn(
        "stdout not defined for child process. Error output won't display"
      );
    } else {
      stderr.pipe(parent.stderr);
    }
  };
}

function handleError(error: unknown): void {
  logger.debug(error);
  logger.error('Execution failed. See error above');
}
