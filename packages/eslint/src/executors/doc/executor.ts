import { ExecutorContext } from '@nrwl/devkit';
import { join } from 'path';
import { generateDocs } from '../../generate-docs';
import { DocGenExecutorSchema } from './schema';

export default async function runExecutor(
  options: DocGenExecutorSchema,
  context: ExecutorContext
) {
  try {
    const input = join(context.root, options.inputPath);
    const output = join(context.root, options.outputPath);
    const tsconfig = join(context.root, options.tsconfigPath);

    await generateDocs(
      input,
      output,
      tsconfig,
      options.verbose
    );

    console.log('Generated documentation successfully!');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Documentation generation failed:', error);

    return {
      success: false,
    };
  }
}
