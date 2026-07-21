/**
 * Lifetime of a refresh token, in milliseconds.
 *
 * Mirrors `config.refreshTokenTtlMc` of the `email` auth provider in the CMS
 * (604800 — seconds, despite the field name; the sibling `accessTokenTtlSec`
 * of 86400 matches the 24h `exp` of a real access-token JWT). Re-check with
 * `AuthProvider.getAuthProviderByMarker('email')` if sessions start expiring
 * earlier than the admin panel says.
 */
const REFRESH_TOKEN_TTL_MS = 604800 * 1000;

/**
 * Earliest timestamp accepted as a real issue time — anything before it means
 * the leading number is not the epoch-ms prefix this parser expects.
 */
const MIN_PLAUSIBLE_ISSUED_AT = Date.UTC(2020, 0, 1);

/**
 * Tolerance for a client clock running ahead of the server.
 */
const CLOCK_SKEW_MS = 24 * 60 * 60 * 1000;

/**
 * isRefreshTokenExpired — whether a stored refresh token is provably past its
 * server-side lifetime, so restoring the session with it is guaranteed to fail.
 *
 * The refresh token is not a JWT: it is `{issuedAtMs}-{uuid}` (verified against
 * a live token, whose prefix equals the access-token `iat` in ms), so its age is
 * readable without a round-trip. Skipping the restore for a token older than the
 * TTL removes the `POST /users/refresh` 400 + `GET /users/me` 401 pair that used
 * to hit the console on every load with a long-abandoned session.
 *
 * Deliberately conservative: anything that does not parse as the known format is
 * reported as NOT expired, so an unrecognised token is still probed against the
 * server rather than silently signing the user out. Rotation needs no special
 * handling — the SDK writes the rotated token, prefix and all.
 * @param   {string}  refreshToken - Token as read from `localStorage`
 * @returns {boolean}              True only when the token is certainly dead
 */
export const isRefreshTokenExpired = (refreshToken: string): boolean => {
  const match = /^(\d{13})-/.exec(refreshToken);

  if (!match?.[1]) {
    return false;
  }

  const issuedAt = Number(match[1]);
  const now = Date.now();

  /** Not the expected prefix (or a badly skewed clock) — leave it to the server */
  if (issuedAt < MIN_PLAUSIBLE_ISSUED_AT || issuedAt > now + CLOCK_SKEW_MS) {
    return false;
  }

  return now - issuedAt > REFRESH_TOKEN_TTL_MS;
};
