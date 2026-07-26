/** Where to land when `state` is missing, malformed or points outside the app. */
const FALLBACK_PATH = '/';

/** Never return the user back onto the callback route — it would loop. */
const CALLBACK_PREFIX = '/auth/callback';

/**
 * Fictitious base origin for the `URL` resolution check below. Never navigated
 * to — it only exposes where the path would actually lead: any candidate that
 * escapes it (`//evil.com`, `/\evil.com`, …) resolves to a different origin.
 */
const INTERNAL_ORIGIN = 'https://internal.example';

/**
 * hasForbiddenChars — detects backslashes and control characters in a path.
 *
 * Browsers normalize `\` to `/` and strip tab / newline while parsing a URL,
 * so `/\evil.com` or `/<TAB>/evil.com` becomes the protocol-relative
 * `//evil.com` after `router.push`. `buildOAuthState` never produces these
 * characters, so their presence means a forged `state`.
 * @param   {string}  path - Decoded candidate return path
 * @returns {boolean}      Whether the path must be rejected
 */
const hasForbiddenChars = (path: string): boolean => {
  for (const char of path) {
    const codePoint = char.codePointAt(0) ?? 0;
    if (char === '\\' || codePoint < 0x20 || codePoint === 0x7f) return true;
  }
  return false;
};

/**
 * Decode the return path from the OAuth `state` parameter.
 *
 * `state` comes back from Google untouched, i.e. it is attacker-controllable —
 * so the decoded value is accepted only when it is provably an in-app path:
 * it must start with a single `/` (not the protocol-relative `//`), contain no
 * backslashes or control characters (`hasForbiddenChars` — the browser would
 * normalize those into `//`), and resolve against a fictitious origin without
 * leaving it. Anything else falls back to the home page. Counterpart of
 * `buildOAuthState`.
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

  if (hasForbiddenChars(path)) return FALLBACK_PATH;
  if (!path.startsWith('/') || path.startsWith('//')) return FALLBACK_PATH;
  if (path.startsWith(CALLBACK_PREFIX)) return FALLBACK_PATH;

  /**
   * Belt and braces: resolve the path the way a browser would and make sure it
   * stays on the (fictitious) origin — catches any protocol-relative form the
   * character checks above might miss. Pure `URL` API, no `window` needed.
   */
  try {
    if (new URL(path, INTERNAL_ORIGIN).origin !== INTERNAL_ORIGIN) {
      return FALLBACK_PATH;
    }
  } catch {
    return FALLBACK_PATH;
  }

  return path;
};
