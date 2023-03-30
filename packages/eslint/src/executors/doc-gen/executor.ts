import { ExecutorContext } from '@nrwl/devkit';
import { join } from 'path';
import { generateDocsForRules } from './doc-gen';
import { DocGenExecutorSchema } from './schema';

// export interface CucumberExecutorOptions extends DocGenExecutorSchema {
//   baseUrl?: string;
//   env: NodeJS.ProcessEnv;
//   args: string[];
// }

export default async function runExecutor(
  options: DocGenExecutorSchema,
  context: ExecutorContext
) {
  // console.log('Executor ran for DocGen', options);

  try {
    const input = join(context.root, options.inputPath);
    const output = join(context.root, options.outputPath);
    const tsconfig = join(context.root, options.tsconfigPath);
    // console.log(options, input, output, tsconfig);

    await generateDocsForRules(
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

// function normalizeOptions(
//   options: DocGenExecutorSchema,
//   // baseUrl?: string
// ): CucumberExecutorOptions {
//   return {
//     ...options,
//     // env: options.env ?? {},
//     // // Schema baseUrl or fallback to derived baseUrl from `startDevServer`
//     // baseUrl: options.baseUrl ?? baseUrl,
//     // args: options.args ?? [],
//   };
// }
