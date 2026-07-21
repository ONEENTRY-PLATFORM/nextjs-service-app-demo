import { isRefreshTokenExpired } from '@/app/store/auth/isRefreshTokenExpired';

/** Server-side lifetime of a refresh token (7 days), in milliseconds. */
const TTL_MS = 604800 * 1000;

/** Shape of a real token: epoch-ms issue time, then a UUID. */
const tokenIssuedAt = (issuedAt: number): string =>
  `${issuedAt}-31ed638b-5a45-47d2-b1ed-0925f605e056`;

describe('isRefreshTokenExpired', () => {
  it('keeps a token issued moments ago', () => {
    expect(isRefreshTokenExpired(tokenIssuedAt(Date.now()))).toBe(false);
  });

  it('keeps a token just inside the TTL', () => {
    const issuedAt = Date.now() - TTL_MS + 60_000;

    expect(isRefreshTokenExpired(tokenIssuedAt(issuedAt))).toBe(false);
  });

  it('reports a token past the TTL as expired', () => {
    const issuedAt = Date.now() - TTL_MS - 60_000;

    expect(isRefreshTokenExpired(tokenIssuedAt(issuedAt))).toBe(true);
  });

  /**
   * The conservative half of the contract: an unrecognised token must still be
   * probed against the server, never discarded locally — a format change on the
   * CMS side would otherwise sign every user out.
   */
  it.each([
    ['a JWT-shaped token', 'header.payload.signature'],
    ['a bare UUID', '31ed638b-5a45-47d2-b1ed-0925f605e056'],
    ['a short numeric prefix', '17846284-uuid'],
    ['an empty string', ''],
  ])('keeps %s', (_label, token) => {
    expect(isRefreshTokenExpired(token)).toBe(false);
  });

  it('keeps a token whose prefix predates the format', () => {
    expect(isRefreshTokenExpired(tokenIssuedAt(Date.UTC(2019, 0, 1)))).toBe(
      false,
    );
  });

  it('keeps a token from the future, so a skewed clock cannot log the user out', () => {
    const issuedAt = Date.now() + 48 * 60 * 60 * 1000;

    expect(isRefreshTokenExpired(tokenIssuedAt(issuedAt))).toBe(false);
  });
});
