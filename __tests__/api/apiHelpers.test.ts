// src/api/apiHelpers.test.ts
import { ApiError, handleApiError } from '@/api/apiHelpers';
import Toast from 'react-native-toast-message';

describe('apiHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ApiError sets message, name, statusCode and originalError', () => {
    const original = { foo: 'bar' };
    const err = new ApiError('Something went wrong', 500, original);

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.name).toBe('ApiError');
    expect(err.message).toBe('Something went wrong');
    expect(err.statusCode).toBe(500);
    expect(err.originalError).toBe(original);
  });

  it('handleApiError returns same ApiError and does not show toast when passed an ApiError', () => {
    const context = 'CTX';
    const apiErr = new ApiError('Already wrapped', 400, { a: 1 });

    const res = handleApiError(apiErr, context);

    expect(res).toBe(apiErr); // same instance
    expect(Toast.show).not.toHaveBeenCalled();
  });

  it('handleApiError wraps Error, shows toast, and preserves original error', () => {
    const context = 'FetchUsers';
    const original = new Error('network failure');

    const res = handleApiError(original, context);

    expect(Toast.show).toHaveBeenCalledTimes(1);
    expect(Toast.show).toHaveBeenCalledWith({
      type: 'error',
      text1: 'Error',
      text2: `[${context}] ${original.message}`,
    });

    expect(res).toBeInstanceOf(ApiError);
    expect(res.message).toBe(`[${context}] ${original.message}`);
    expect(res.originalError).toBe(original);
    expect(res.statusCode).toBeUndefined();
  });

  it('handleApiError wraps non-Error values (string), shows toast and sets originalError to the raw value', () => {
    const context = 'DoThing';
    const original = 'some string error';

    const res = handleApiError(original, context);

    expect(Toast.show).toHaveBeenCalledTimes(1);
    expect(Toast.show).toHaveBeenCalledWith({
      type: 'error',
      text1: 'Error',
      text2: `[${context}] ${String(original)}`,
    });

    expect(res).toBeInstanceOf(ApiError);
    expect(res.message).toBe(`[${context}] ${String(original)}`);
    expect(res.originalError).toBe(original);
  });

  it('handleApiError handles null/undefined by stringifying them and showing toast', () => {
    const context = 'NullCase';

    const resNull = handleApiError(null, context);
    expect(Toast.show).toHaveBeenCalledWith({
      type: 'error',
      text1: 'Error',
      text2: `[${context}] ${String(null)}`,
    });
    expect(resNull).toBeInstanceOf(ApiError);
    expect(resNull.message).toBe(`[${context}] ${String(null)}`);
    expect(resNull.originalError).toBeNull();

    jest.clearAllMocks();

    const resUndef = handleApiError(undefined, context);
    expect(Toast.show).toHaveBeenCalledWith({
      type: 'error',
      text1: 'Error',
      text2: `[${context}] ${String(undefined)}`,
    });
    expect(resUndef).toBeInstanceOf(ApiError);
    expect(resUndef.message).toBe(`[${context}] ${String(undefined)}`);
    expect(resUndef.originalError).toBeUndefined();
  });
});
