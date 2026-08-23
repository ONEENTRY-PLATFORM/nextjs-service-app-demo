import type { IError } from 'oneentry/types';

import { expectSdkList } from '@/app/api/utils/expectSdkList';

describe('expectSdkList', () => {
  it('passes a real array through', () => {
    const accounts = [{ id: 1, isVisible: true, isUsed: true }];

    expect(expectSdkList(accounts, 'Payments.getAccounts')).toEqual({
      data: accounts,
    });
  });

  it('accepts an empty array as data, not as a failure', () => {
    expect(expectSdkList([], 'Admins.getAdminsInfo')).toEqual({ data: [] });
  });

  it('forwards an IError from the API unchanged', () => {
    const error: IError = {
      statusCode: 401,
      message: 'Unauthorized',
      pageData: null,
      timestamp: '2026-08-23T00:00:00.000Z',
    };

    expect(expectSdkList(error, 'Payments.getAccounts')).toEqual({ error });
  });

  it('rejects the flattened {} instead of letting `.filter` throw on it', () => {
    const result = expectSdkList({}, 'Payments.getAccounts');

    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error.statusCode).toBe(502);
      expect(result.error.message).toContain('Payments.getAccounts');
      expect(result.error.message).toContain('an array');
    }
  });

  it.each([
    ['null', null],
    ['a string', 'oops'],
    ['undefined', undefined],
  ])('rejects %s', (_label, payload) => {
    expect('error' in expectSdkList(payload, 'Admins.getAdminsInfo')).toBe(
      true,
    );
  });
});
