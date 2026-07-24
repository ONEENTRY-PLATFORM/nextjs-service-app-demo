import { toErrorMessage } from '@/components/utils/toErrorMessage';

describe('toErrorMessage', () => {
  it('returns the message of a real Error', () => {
    expect(toErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('uses the default fallback for a non-Error', () => {
    expect(toErrorMessage('nope')).toBe('An unexpected error occurred');
    expect(toErrorMessage(undefined)).toBe('An unexpected error occurred');
    expect(toErrorMessage({ statusCode: 500 })).toBe(
      'An unexpected error occurred',
    );
  });

  it('uses a caller-supplied fallback for a non-Error', () => {
    expect(toErrorMessage('nope', 'Authentication failed')).toBe(
      'Authentication failed',
    );
  });

  it('prefers a real Error message over the fallback', () => {
    expect(toErrorMessage(new Error('boom'), 'Authentication failed')).toBe(
      'boom',
    );
  });

  it('treats an Error subclass as an Error', () => {
    class ApiError extends Error {}
    expect(toErrorMessage(new ApiError('bad'), 'x')).toBe('bad');
  });
});
