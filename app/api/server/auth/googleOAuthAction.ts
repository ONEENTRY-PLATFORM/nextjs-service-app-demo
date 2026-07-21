'use server';

import { defineOneEntry } from 'oneentry';
import type { IAuthEntity } from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import type { IError } from 'oneentry/dist/base/utils';

import { isError, LANG_CODE } from '@/app/api/api/api';

/**
 * Exchange a Google OAuth `code` for OneEntry auth tokens (Server Action).
 *
 * The `client_secret` must never reach the browser, so the code→token exchange
 * runs here on the server. Two OneEntry specifics are handled:
 *
 * 1. A **per-request** SDK instance is created with `defineOneEntry(url,
 * { token, deviceMetadata })` rather than mutating the shared `getApi()`
 * singleton — its auth state is shared across all visitors, and
 * `setDeviceMetadata()` on it would race between concurrent OAuth callbacks.
 * 2. The API binds the refresh token to the `x-device-metadata` fingerprint
 * (SDK >= 1.0.155). The browser fingerprint is captured on the callback page
 * via `getApi().AuthProvider.getDeviceMetadata()` and passed in here, so the
 * issued refresh token stays refreshable from that browser. Without it the
 * token would bind to the server's Node fingerprint and every proactive
 * `/refresh` from the browser would 400 → log the user out.
 *
 * `redirectUri` is passed from the client so it matches, byte for byte, the
 * `redirect_uri` used in the initial redirect (OAuth requires the two to be
 * identical). The callback page derives it from `window.location.origin`, which
 * keeps dev (`http://localhost:3700`) and prod working from one code path.
 * @param   {string}          code           - Authorization code returned by Google
 * @param   {string}          deviceMetadata - Browser fingerprint string from the callback page
 * @param   {string}          redirectUri    - The exact redirect URI used to obtain the code
 * @returns {Promise<object>}                Envelope: `{ isError, error?, token? }`
 */
export async function googleOAuthAction(
  code: string,
  deviceMetadata: string,
  redirectUri: string,
): Promise<{ isError: boolean; error?: IError; token?: IAuthEntity }> {
  /**
   * An empty `deviceMetadata` would silently fall back to the server's Node
   * fingerprint — the token would not refresh from the browser. Fail loudly.
   */
  if (!deviceMetadata) {
    return {
      isError: true,
      error: {
        statusCode: 400,
        message: 'deviceMetadata was not passed from the callback page',
      } as IError,
    };
  }

  /** Per-request instance stamped with the browser fingerprint (see JSDoc). */
  const api = defineOneEntry(process.env.NEXT_PUBLIC_ONEENTRY_URL as string, {
    token: process.env.NEXT_PUBLIC_ONEENTRY_TOKEN as string,
    langCode: LANG_CODE,
    deviceMetadata,
  });

  /**
   * `oauth()` handles both first-time login and registration — no separate
   * sign-up flow is needed. Marker `'google'` is the OAuth provider configured
   * in the CMS (`type: 'oauth'`, verified via inspect-auth-providers).
   */
  const result = await api.AuthProvider.oauth('google', {
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
    client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });

  if (isError(result)) {
    return { isError: true, error: result };
  }

  return { isError: false, token: result as IAuthEntity };
}
