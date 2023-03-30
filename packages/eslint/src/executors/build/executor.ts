import { command } from '../utils/command';
import { BuildExecutorSchema } from './schema';

export default async function runExecutor(
  options: BuildExecutorSchema,
) {
  console.log('Executor ran for Build', options);

  try {
    await command('npx tsc --tsconfig ${options.tsconfig}');

    return {
      success: true
    };
  } catch(error) {
    console.error(error);
    return {
      success: false,
    };
  }
}
