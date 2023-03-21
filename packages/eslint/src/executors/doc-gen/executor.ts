import { DocGenExecutorSchema } from './schema';

// export interface CucumberExecutorOptions extends DocGenExecutorSchema {
//   baseUrl?: string;
//   env: NodeJS.ProcessEnv;
//   args: string[];
// }

export default async function runExecutor(
  options: DocGenExecutorSchema,
) {
  // let success = false;

  console.log('Executor ran for DocGen', options);

  return {
    success: true,
  };
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
