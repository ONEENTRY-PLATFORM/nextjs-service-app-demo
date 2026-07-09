/**
 * Unit tests for the OneEntry SDK singleton layer (app/api/api/api.ts).
 *
 * The `oneentry` package is mocked: each defineOneEntry() call returns a fresh
 * fake instance whose AuthProvider setters mutate a local state object, which
 * is enough to exercise getApi/hasActiveSession/syncTokens/reDefine contracts.
 */
jest.mock('oneentry', () => {
  const makeInstance = () => {
    const state: { accessToken?: string; refreshToken?: string } = {};
    return {
      AuthProvider: {
        state,
        setAccessToken: jest.fn((token: string) => {
          state.accessToken = token;
        }),
        setRefreshToken: jest.fn((token: string) => {
          state.refreshToken = token;
        }),
      },
    };
  };
  return {
    defineOneEntry: jest.fn(() => makeInstance()),
  };
});

const importApi = () => import('@/app/api/api/api');
type ApiModule = Awaited<ReturnType<typeof importApi>>;

describe('app/api/api/api.ts', () => {
  let api: ApiModule;
  let defineMock: jest.Mock;

  beforeEach(async () => {
    // Fresh module registry per test: the api module holds singleton state,
    // and the 'oneentry' mock must come from the SAME registry to record calls
    jest.resetModules();
    localStorage.clear();
    const oneentry = await import('oneentry');
    defineMock = oneentry.defineOneEntry as jest.Mock;
    defineMock.mockClear();
    api = await importApi();
  });

  it('creates a single SDK instance and getApi() always returns it', () => {
    expect(defineMock).toHaveBeenCalledTimes(1);
    expect(api.getApi()).toBe(api.getApi());
  });

  describe('isError', () => {
    it('narrows objects with a numeric statusCode', () => {
      expect(api.isError({ statusCode: 404, message: 'Not Found' })).toBe(true);
      expect(api.isError({ statusCode: 500 })).toBe(true);
    });

    it('rejects entities, null and primitives', () => {
      expect(api.isError({ id: 1, attributeValues: {} })).toBe(false);
      expect(api.isError(null)).toBe(false);
      expect(api.isError(undefined)).toBe(false);
      expect(api.isError('error')).toBe(false);
    });
  });

  describe('hasActiveSession / syncTokens', () => {
    it('is false until tokens are synced', () => {
      expect(api.hasActiveSession()).toBe(false);
    });

    it('writes both tokens into the CURRENT instance without recreating it', () => {
      const instance = api.getApi();
      api.syncTokens('access-1', 'refresh-1');

      expect(api.getApi()).toBe(instance);
      expect(instance.AuthProvider.setAccessToken).toHaveBeenCalledWith(
        'access-1',
      );
      expect(instance.AuthProvider.setRefreshToken).toHaveBeenCalledWith(
        'refresh-1',
      );
      expect(api.hasActiveSession()).toBe(true);
    });
  });

  describe('reDefine', () => {
    it('is a no-op for an empty refresh token', async () => {
      const instance = api.getApi();
      await api.reDefine('');

      expect(api.getApi()).toBe(instance);
      expect(defineMock).toHaveBeenCalledTimes(1);
    });

    it('recreates the instance with the refresh token in the auth config', async () => {
      const before = api.getApi();
      await api.reDefine('refresh-2');

      expect(api.getApi()).not.toBe(before);
      expect(defineMock).toHaveBeenCalledTimes(2);

      const config = defineMock.mock.calls[1]?.[1] as {
        langCode: string;
        auth: { refreshToken: string; saveFunction: unknown };
      };
      expect(config.auth.refreshToken).toBe('refresh-2');
      expect(config.langCode).toBe(api.LANG_CODE);
      expect(typeof config.auth.saveFunction).toBe('function');
    });
  });

  describe('saveFunction (SDK token-rotation callback)', () => {
    const getSaveFunction = (): ((token: string) => Promise<void>) => {
      const config = defineMock.mock.calls[0]?.[1] as {
        auth: { saveFunction: (token: string) => Promise<void> };
      };
      return config.auth.saveFunction;
    };

    it('persists the rotated token under the "refresh-token" key', async () => {
      await getSaveFunction()('rotated-token');

      expect(localStorage.getItem('refresh-token')).toBe('rotated-token');
    });

    it('does not overwrite the stored token with an empty value', async () => {
      localStorage.setItem('refresh-token', 'existing');
      await getSaveFunction()('');

      expect(localStorage.getItem('refresh-token')).toBe('existing');
    });
  });
});
