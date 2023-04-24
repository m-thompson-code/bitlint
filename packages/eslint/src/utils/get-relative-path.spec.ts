import { getRelativePath } from './get-relative-path';

describe('getRelativePath()', () => {
  it('should create relative path to destination', () => {
    expect(getRelativePath('', 'to/here')).toBe('./to/here');
    expect(getRelativePath('/', '/to/here')).toBe('./to/here');
    expect(getRelativePath('some/dir/to', 'some/dir/to/here')).toBe('./here');
    expect(getRelativePath('/some/dir/to', '/some/dir/to/here')).toBe('./here');
  });

  it('should handle backwards paths', () => {
    expect(getRelativePath('from/this/directory', '')).toBe('../../..');
    expect(getRelativePath('/from/this/directory', '/')).toBe('../../..');
    expect(getRelativePath('from/this/directory', 'from/this')).toBe('..');
    expect(getRelativePath('/from/this/directory', '/from/this')).toBe('..');
  });

  it('should create relative path from one sub directory to another', () => {
    expect(getRelativePath('a/sub/dir', 'b/sub/dir')).toBe('../../../b/sub/dir');
    expect(getRelativePath('/a/sub/dir', '/b/sub/dir')).toBe('../../../b/sub/dir');
    expect(getRelativePath('parent/dir/a/sub/dir', 'parent/dir/b/sub/dir')).toBe('../../../b/sub/dir');
    expect(getRelativePath('/parent/dir/a/sub/dir', '/parent/dir/b/sub/dir')).toBe('../../../b/sub/dir');
  });
});
