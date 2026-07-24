/** Where to land when `state` is missing, malformed or points outside the app. */
const FALLBACK_PATH = '/';

/** Never return the user back onto the callback route — it would loop. */
const CALLBACK_PREFIX = '/auth/callback';

/**
 * Decode the return path from the OAuth `state` parameter.
 *
 * `state` comes back from Google untouched, i.e. it is attacker-controllable —
 * so the decoded value is accepted only if it is a same-origin relative path
 * (`/…`, but not the protocol-relative `//evil.com`), otherwise the user goes
 * to the home page. Counterpart of `buildOAuthState`.
 * @param   {string | null} state - Raw `state` query param from the callback URL
 * @returns {string}              Safe in-app path to redirect to after sign-in
 */
export const parseOAuthState = (state: string | null): string => {
  if (!state) return FALLBACK_PATH;

  let path: string;
  try {
    path = decodeURIComponent(state);
  } catch {
    /** Malformed percent-encoding — not something we produced. */
    return FALLBACK_PATH;
  }

  if (!path.startsWith('/') || path.startsWith('//')) return FALLBACK_PATH;
  if (path.startsWith(CALLBACK_PREFIX)) return FALLBACK_PATH;

  return path;
};
