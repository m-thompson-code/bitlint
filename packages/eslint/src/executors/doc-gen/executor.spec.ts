import { DocGenExecutorSchema } from './schema';
import executor from './executor';

const options: DocGenExecutorSchema = {};

describe('DocGen Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});