/**
 * Unit tests for the centralized error layer (app/utils/errorHandler.ts).
 *
 * `errorHandler` transitively imports the OneEntry SDK singleton (via `isError`),
 * so `oneentry` is stubbed to keep the module hermetic — the helpers under test
 * never touch the network. `react-toastify` is mocked to observe the hook's
 * notification without a real toast container.
 */
jest.mock('oneentry', () => ({
  defineOneEntry: jest.fn(() => ({ AuthProvider: {} })),
}));

const toastError = jest.fn();
jest.mock('react-toastify', () => ({
  toast: { error: (msg: string) => toastError(msg) },
}));

import {
  ApiError,
  formatErrorMessage,
  handleApiError,
  isIError,
  useApiErrorHandler,
} from '@/app/utils/errorHandler';

describe('ApiError', () => {
  it('carries the message, status code and original error', () => {
    const cause = { statusCode: 404 };
    const error = new ApiError('Boom', 404, cause);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
    expect(error.message).toBe('Boom');
    expect(error.statusCode).toBe(404);
    expect(error.originalError).toBe(cause);
  });
});

describe('handleApiError', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    // The handler logs every branch; silence it so the suite output stays clean
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => consoleSpy.mockRestore());

  it('maps a OneEntry error (numeric statusCode) onto its status', () => {
    const result = handleApiError('ctx', {
      statusCode: 401,
      message: 'Unauthorized',
    });

    expect(result).toBeInstanceOf(ApiError);
    expect(result.statusCode).toBe(401);
    expect(result.message).toBe('Unauthorized');
  });

  it('wraps a generic Error as a 500', () => {
    const result = handleApiError('ctx', new Error('network down'));

    expect(result.statusCode).toBe(500);
    expect(result.message).toBe('network down');
  });

  it('turns an unknown throw into a generic 500 ApiError', () => {
    const result = handleApiError('ctx', 'just a string');

    expect(result.statusCode).toBe(500);
    expect(result.message).toBe('An unknown error occurred');
  });
});

describe('formatErrorMessage', () => {
  it('returns a friendly message for each known status code', () => {
    expect(formatErrorMessage({ statusCode: 400 })).toMatch(/bad request/i);
    expect(formatErrorMessage({ statusCode: 401 })).toMatch(/log in/i);
    expect(formatErrorMessage({ statusCode: 403 })).toMatch(/permission/i);
    expect(formatErrorMessage({ statusCode: 404 })).toMatch(/not found/i);
    expect(formatErrorMessage({ statusCode: 500 })).toMatch(/try again/i);
  });

  it('falls back to the error message for an unmapped status code', () => {
    expect(
      formatErrorMessage({ statusCode: 418, message: "I'm a teapot" }),
    ).toBe("I'm a teapot");
  });

  it('uses a plain Error message, then the default for anything else', () => {
    expect(formatErrorMessage(new Error('boom'))).toBe('boom');
    expect(formatErrorMessage(null, 'fallback')).toBe('fallback');
  });
});

describe('isIError', () => {
  it('is the same guard re-exported from the api layer', () => {
    expect(isIError({ statusCode: 404 })).toBe(true);
    expect(isIError({ id: 1 })).toBe(false);
  });
});

describe('useApiErrorHandler', () => {
  it('surfaces the formatted message through a toast', () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    toastError.mockClear();

    const handle = useApiErrorHandler() as (error: unknown) => ApiError;
    const result = handle({ statusCode: 500, message: 'Server error' });

    expect(result).toBeInstanceOf(ApiError);
    expect(toastError).toHaveBeenCalledWith('Server error');
  });
});
