/**
 * The browser session in `localStorage` — one adapter over the two keys the
 * auth flow persists, rather than the raw strings.
 *
 * They used to be inlined across six modules (session restore, login, logout,
 * the SDK's save function, both sign-out buttons); a typo in any one of those
 * silently broke either session restore or sign-out, with no type error to
 * catch it. Every accessor is SSR-safe and reports "no session" on the server.
 */

/** Long-lived refresh token the session is restored from. */
export const REFRESH_TOKEN_KEY = 'refresh-token';

/**
 * Marker of the auth provider the session was created with. The SDK's proactive
 * refresh must hit `/marker/{providerMarker}/users/refresh` for the RIGHT
 * provider, so it is persisted alongside the token.
 */
export const AUTH_PROVIDER_MARKER_KEY = 'authProviderMarker';

/** Provider assumed for sessions saved before the marker was persisted. */
export const DEFAULT_AUTH_PROVIDER_MARKER = 'email';

/**
 * readRefreshToken — the stored refresh token, or `null` when there is no
 * session to restore.
 * @returns {string | null} Refresh token, or `null`
 */
export const readRefreshToken = (): string | null =>
  typeof window === 'undefined'
    ? null
    : localStorage.getItem(REFRESH_TOKEN_KEY);

/**
 * readAuthProviderMarker — the provider the current session was created with.
 *
 * Falls back to `email` rather than returning nothing: sessions saved before
 * the marker was persisted carry no value, and refreshing them against the
 * wrong provider would fail.
 * @returns {string} Provider marker, never empty
 */
export const readAuthProviderMarker = (): string =>
  typeof window === 'undefined'
    ? DEFAULT_AUTH_PROVIDER_MARKER
    : localStorage.getItem(AUTH_PROVIDER_MARKER_KEY) ||
      DEFAULT_AUTH_PROVIDER_MARKER;

/**
 * saveAuthSession — persists what a page reload needs to restore the session:
 * the refresh token and the provider it belongs to.
 *
 * The token is also written by the SDK's own save function during `auth()`;
 * writing it here again is a harmless, explicit belt-and-suspenders, and the
 * marker is ours to persist regardless.
 * @param {object} session                    - Session to persist
 * @param {string} session.refreshToken       - Long-lived refresh token
 * @param {string} session.authProviderMarker - Provider marker (e.g. `email`)
 */
export const saveAuthSession = ({
  refreshToken,
  authProviderMarker,
}: {
  refreshToken: string;
  authProviderMarker: string;
}): void => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(AUTH_PROVIDER_MARKER_KEY, authProviderMarker);
};

/**
 * clearAuthSession — drops the stored session.
 *
 * Must run even when the server-side logout call fails (the token may already
 * be revoked): a revoked refresh token left behind is retried by the SDK before
 * every request, which is endless 400/401 noise (`rules/tokens.md`).
 */
export const clearAuthSession = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_PROVIDER_MARKER_KEY);
};
