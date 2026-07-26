import { parseOAuthState } from '@/app/auth/callback/google/parseOAuthState';

describe('parseOAuthState', () => {
  it('accepts plain in-app paths', () => {
    expect(parseOAuthState('/profile')).toBe('/profile');
    expect(parseOAuthState('/booking?step=2')).toBe('/booking?step=2');
    expect(parseOAuthState('/services#hair')).toBe('/services#hair');
  });

  /** Round-trip of what `buildOAuthState` actually produces. */
  it('decodes the percent-encoded path buildOAuthState emits', () => {
    expect(parseOAuthState('%2Fbooking%3Fstep%3D2')).toBe('/booking?step=2');
  });

  it('falls back to home when state is missing or malformed', () => {
    expect(parseOAuthState(null)).toBe('/');
    expect(parseOAuthState('')).toBe('/');
    /** Broken percent-encoding — decodeURIComponent throws. */
    expect(parseOAuthState('%')).toBe('/');
  });

  it('rejects absolute and protocol-relative URLs', () => {
    expect(parseOAuthState('https://evil.com')).toBe('/');
    expect(parseOAuthState('//evil.com')).toBe('/');
    /** Decodes to `///evil.com` — still protocol-relative after one hop. */
    expect(parseOAuthState('/%2F%2Fevil.com')).toBe('/');
    expect(parseOAuthState('%2F%2Fevil.com')).toBe('/');
  });

  /**
   * Browsers normalize `\` to `/` when parsing a URL, so a backslash path is
   * a disguised `//evil.com` even though it passes a naive `//` check.
   */
  it('rejects backslash disguises of protocol-relative URLs', () => {
    expect(parseOAuthState('/\\evil.com')).toBe('/');
    expect(parseOAuthState('/\\/evil.com')).toBe('/');
    /** Percent-encoded backslash — same payload after decoding. */
    expect(parseOAuthState('/%5C/evil.com')).toBe('/');
  });

  /**
   * Tab and newline are stripped by the browser's URL parser, so
   * `/<TAB>/evil.com` collapses into `//evil.com` after `router.push`.
   */
  it('rejects paths with control characters', () => {
    expect(parseOAuthState('/%09/evil.com')).toBe('/');
    expect(parseOAuthState('/\t/evil.com')).toBe('/');
    expect(parseOAuthState('/\n/evil.com')).toBe('/');
    expect(parseOAuthState('/pro\tfile')).toBe('/');
    expect(parseOAuthState('/pro\nfile')).toBe('/');
  });

  /** Returning onto the callback route would loop the OAuth exchange. */
  it('never returns the user back onto the callback route', () => {
    expect(parseOAuthState('/auth/callback/google?code=x')).toBe('/');
  });
});
