import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';

const TIMEOUT = 120_000;

describe('eslint e2e', () => {
  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependant on one another.
  beforeAll(() => {
    ensureNxProject('@bitovi/eslint', 'dist/packages/eslint');
  });

  afterAll(() => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    runNxCommandAsync('reset');
  });

  // it('should create eslint', async () => {
  //   const projectName = uniq('eslint');
  //   await runNxCommandAsync(`generate @bitovi/eslint:eslint ${projectName}`);
  //   const result = await runNxCommandAsync(`build ${projectName}`);
  //   expect(result.stdout).toContain('Executor ran');
  // }, TIMEOUT);

  describe('--directory', () => {
    it('should create src in the specified directory', async () => {
      const projectName = uniq('eslint');
      const eslintPluginName = `eslint-plugin-${projectName}`;
      await runNxCommandAsync(
        `generate @bitovi/eslint:eslint-plugin ${projectName} --directory subdir`
      );
      expect(() =>
        checkFilesExist(`libs/subdir/${eslintPluginName}/src/index.ts`)
      ).not.toThrow();
    }, TIMEOUT);
  });

  describe('--tags', () => {
    it('should add tags to the project', async () => {
      const projectName = uniq('eslint');
      const eslintPluginName = `eslint-plugin-${projectName}`;

      ensureNxProject('@bitovi/eslint', 'dist/packages/eslint');
      await runNxCommandAsync(
        `generate @bitovi/eslint:eslint-plugin ${projectName} --tags e2etag,e2ePackage`
      );
      const project = readJson(`libs/${eslintPluginName}/project.json`);
      expect(project.tags).toEqual(['e2etag', 'e2ePackage']);
    }, TIMEOUT);
  });
});
