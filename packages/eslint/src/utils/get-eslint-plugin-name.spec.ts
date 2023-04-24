import { getESLintPluginName } from './get-eslint-plugin-name';

describe('getESLintPluginName()', () => {
  it('should add \'eslint-plugin-\' to beginning of string', () => {
    expect(getESLintPluginName('bitovi')).toBe('eslint-plugin-bitovi');
  });

  it('should not change strings that already start with \'eslint-plugin-\'', () => {
    expect(getESLintPluginName('eslint-plugin-bitovi')).toBe('eslint-plugin-bitovi');
  });

  it('should handle org names', () => {
    expect(getESLintPluginName('@bitovi/bitlint')).toBe('@bitovi/eslint-plugin-bitlint');
    expect(getESLintPluginName('@bitovi/eslint-plugin-bitlint')).toBe('@bitovi/eslint-plugin-bitlint');
  });
});
