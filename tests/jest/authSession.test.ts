import {
  AUTH_PROVIDER_MARKER_KEY,
  clearAuthSession,
  readAuthProviderMarker,
  readRefreshToken,
  REFRESH_TOKEN_KEY,
  saveAuthSession,
} from '@/app/store/auth/authStorage';
import { isAuthFailure } from '@/app/store/auth/useLogoutOnAuthFailure';

describe('auth session storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips a saved session', () => {
    saveAuthSession({
      refreshToken: 'rt-123',
      authProviderMarker: 'google',
    });

    expect(readRefreshToken()).toBe('rt-123');
    expect(readAuthProviderMarker()).toBe('google');
  });

  it('reports no refresh token for a guest', () => {
    expect(readRefreshToken()).toBeNull();
  });

  it('assumes the email provider for a legacy session without a marker', () => {
    localStorage.setItem(REFRESH_TOKEN_KEY, 'rt-legacy');

    expect(readAuthProviderMarker()).toBe('email');
  });

  it('clears BOTH keys, so no revoked token is left for the SDK to retry', () => {
    saveAuthSession({ refreshToken: 'rt-123', authProviderMarker: 'google' });

    clearAuthSession();

    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(AUTH_PROVIDER_MARKER_KEY)).toBeNull();
  });
});

describe('isAuthFailure', () => {
  it.each([401, 403])('treats %i as a confirmed auth failure', (statusCode) => {
    expect(isAuthFailure({ statusCode })).toBe(true);
  });

  /**
   * The rule that matters (`rules/tokens.md`): a transient failure must NOT end
   * the session, or a connection hiccup signs the user out.
   */
  it.each([0, 404, 429, 500, 503])('keeps the session on %i', (statusCode) => {
    expect(isAuthFailure({ statusCode })).toBe(false);
  });

  it('keeps the session when there is no error at all', () => {
    expect(isAuthFailure(undefined)).toBe(false);
  });

  it('keeps the session for an error without a status code', () => {
    expect(isAuthFailure(new Error('Network request failed'))).toBe(false);
  });
});
