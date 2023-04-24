import { getErrorMessage } from './get-error-message';

describe('getErrorMessage()', () => {
  it('should get message from Error instance', () => {
    expect(getErrorMessage(new Error('some message'))).toBe('some message');
    expect(getErrorMessage({ message: 'some message' })).toBe('some message');
  });

  it('should get message from any instance', () => {
    expect(getErrorMessage({ message: 'some message' })).toBe('some message');
  });

  it('should convert anything else to string', () => {
    expect(getErrorMessage({ moo: 'cow' })).toBe('[object Object]');
  });

  it('should return empty string for null and undefined', () => {
    expect(getErrorMessage(undefined)).toBe('');
    expect(getErrorMessage(null)).toBe('');
    expect(getErrorMessage(false)).toBe('false');
    expect(getErrorMessage(0)).toBe('0');
  });

  it('should convert truthy primatives to string', () => {
    expect(getErrorMessage(true)).toBe('true');
    expect(getErrorMessage(1)).toBe('1');
    expect(getErrorMessage('some message')).toBe('some message');
  });
});
