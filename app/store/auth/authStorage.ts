/**
 * The browser session in `localStorage` — one adapter over the two keys the
 * auth flow persists, rather than the raw strings.
 *
 * They used to be inlined across six modules (session restore, login, logout,
 * the SDK's save function, both sign-out buttons); a typo in any one of those
 * silently broke either session restore or sign-out, with no type error to
 * catch it. Every accessor is SSR-safe and reports "no session" both on the
 * server and in browsers that block storage (see {@link safeGetItem}).
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
 * safeGetItem — `localStorage.getItem` with blocked storage treated as empty.
 *
 * With storage blocked (Safari/Chrome "Block all cookies", embedded webviews)
 * merely touching `localStorage` throws a SecurityError — a `typeof window`
 * check does not guard against it. Every accessor below funnels through these
 * helpers, degrading to "no session" / noop the same way redux-persist does.
 * @param   {string}        key - Storage key to read
 * @returns {string | null}     Stored value, or `null` when absent or storage is unavailable
 */
const safeGetItem = (key: string): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/**
 * safeSetItem — `localStorage.setItem` degrading to a noop when storage is
 * unavailable (see {@link safeGetItem}).
 * @param {string} key   - Storage key to write
 * @param {string} value - Value to store
 */
const safeSetItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage blocked — the session just won't survive a reload.
  }
};

/**
 * safeRemoveItem — `localStorage.removeItem` degrading to a noop when storage
 * is unavailable (see {@link safeGetItem}).
 * @param {string} key - Storage key to drop
 */
const safeRemoveItem = (key: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage blocked — there is nothing persisted to drop.
  }
};

/**
 * readRefreshToken — the stored refresh token, or `null` when there is no
 * session to restore (or storage is unavailable).
 * @returns {string | null} Refresh token, or `null`
 */
export const readRefreshToken = (): string | null =>
  safeGetItem(REFRESH_TOKEN_KEY);

/**
 * readAuthProviderMarker — the provider the current session was created with.
 *
 * Falls back to `email` rather than returning nothing: sessions saved before
 * the marker was persisted carry no value, and refreshing them against the
 * wrong provider would fail.
 * @returns {string} Provider marker, never empty
 */
export const readAuthProviderMarker = (): string =>
  safeGetItem(AUTH_PROVIDER_MARKER_KEY) || DEFAULT_AUTH_PROVIDER_MARKER;

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
  safeSetItem(REFRESH_TOKEN_KEY, refreshToken);
  safeSetItem(AUTH_PROVIDER_MARKER_KEY, authProviderMarker);
};

/**
 * clearAuthSession — drops the stored session.
 *
 * Must run even when the server-side logout call fails (the token may already
 * be revoked): a revoked refresh token left behind is retried by the SDK before
 * every request, which is endless 400/401 noise (`rules/tokens.md`).
 */
export const clearAuthSession = (): void => {
  safeRemoveItem(REFRESH_TOKEN_KEY);
  safeRemoveItem(AUTH_PROVIDER_MARKER_KEY);
};
