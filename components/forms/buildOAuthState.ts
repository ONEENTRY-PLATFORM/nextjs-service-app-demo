/**
 * Encode the page the user is leaving into the OAuth `state` parameter.
 *
 * Google returns `state` back to the callback URL byte for byte, so it is the
 * standard place to carry «where to come back to» through a full-page redirect
 * (sessionStorage would not survive a different tab / restored session).
 * Only the in-app part of the URL is stored — path + query + hash, never the
 * origin. Note this alone is no open-redirect protection: an attacker crafts
 * `state` themselves, bypassing this builder — the callback side must (and
 * does) validate the decoded value in `parseOAuthState`.
 * @returns {string} URL-encoded return path, e.g. `%2Fbooking%3Fstep%3D2`
 */
export const buildOAuthState = (): string => {
  const { pathname, search, hash } = window.location;
  return encodeURIComponent(`${pathname}${search}${hash}`);
};
