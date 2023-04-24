import { removeUndefinedProperties } from './remove-undefined-properties';

describe('removeUndefinedProperties()', () => {
  it('should remove any properties that are undefined from object', () => {
    const obj = {
      first: 'value',
      second: true,
      third: 123,
      fourth: null,
      fifth: undefined,
    };

    removeUndefinedProperties(obj)

    expect(obj).toStrictEqual({
      first: 'value',
      second: true,
      third: 123,
      fourth: null,
    });

    expect(obj).not.toStrictEqual({
      first: 'value',
      second: true,
      third: 123,
      fourth: null,
      fifth: undefined,
    });
  });
});
