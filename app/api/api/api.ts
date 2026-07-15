import { defineOneEntry } from 'oneentry';
import type { IError } from 'oneentry/dist/base/utils';

const PROJECT_URL = process.env.NEXT_PUBLIC_ONEENTRY_URL as string;
const APP_TOKEN = process.env.NEXT_PUBLIC_ONEENTRY_TOKEN as string;

/**
 * Default language code for the SDK. Set once here for a monolingual project
 * DO NOT pass langCode explicitly to SDK calls, rely on this default.
 */
export const LANG_CODE = 'en_US';

/**
 * Save refresh token to localStorage.
 *
 * This function is used to update user JWT token and save to localStorage.
 * It's part of the authentication system for the OneEntry API.
 * @param   {string}        refreshToken - Refresh token from API to be stored in localStorage
 * @returns {Promise<void>}              Promise that resolves when the token is saved
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
const saveFunction = async (refreshToken: string): Promise<void> => {
  if (!refreshToken || typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('refresh-token', refreshToken);
};

/**
 * Internal SDK instance. Mutated by {@link reDefine}; accessed everywhere via {@link getApi}.
 */
let apiInstance = defineOneEntry(PROJECT_URL, {
  token: APP_TOKEN,
  langCode: LANG_CODE,
  auth: {
    saveFunction,
  },
});

/**
 * Returns the current SDK instance.
 *
 * Always call as a function — never cache the result, since `reDefine()` may replace the
 * underlying instance during session restore.
 * @returns {ReturnType<typeof defineOneEntry>} Current OneEntry SDK instance
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getApi = (): ReturnType<typeof defineOneEntry> => apiInstance;

/**
 * Returns true if the SDK currently holds a valid access token.
 *
 * The SDK stores auth state inside `AuthProvider` — not on the top-level api object.
 * This helper is the correct way to check for an active session before calling user-authorized endpoints.
 * @returns {boolean} true when accessToken is present
 */
export function hasActiveSession(): boolean {
  const authProvider = apiInstance.AuthProvider as unknown as {
    state?: { accessToken?: string };
  };
  return !!authProvider?.state?.accessToken;
}

/**
 * Writes both tokens directly into the current SDK instance.
 *
 * Use right after a successful `auth()` / `signUp()` / `oauth()` call instead of `reDefine()`
 * — avoids a 401 on the first user request (reDefine creates a fresh instance without an accessToken).
 * @param   {string} accessToken  - access token from the auth response
 * @param   {string} refreshToken - refresh token from the auth response
 * @returns {void}
 */
export function syncTokens(accessToken: string, refreshToken: string): void {
  apiInstance.AuthProvider.setAccessToken(accessToken);
  apiInstance.AuthProvider.setRefreshToken(refreshToken);
}

/**
 * Drops the user session from the SDK by recreating a clean app-token instance.
 *
 * Call after `AuthProvider.logout()`: the SDK instance otherwise keeps the
 * revoked refresh token in state and proactively retries `POST /users/refresh`
 * with it before every subsequent request, spamming 400/401 to the console
 * (see rules/tokens.md — clearing a dead token is the application's job).
 * @returns {void}
 */
export function clearSession(): void {
  apiInstance = defineOneEntry(PROJECT_URL, {
    token: APP_TOKEN,
    langCode: LANG_CODE,
    auth: {
      saveFunction,
    },
  });
}

/**
 * Redefine API configuration with refresh token.
 *
 * This function is used to update API config with a refresh token.
 * It's typically called when a user session needs to be restored or refreshed.
 * @param   {string}        refreshToken - Refresh token from localStorage to reinitialize the API
 * @returns {Promise<void>}              Promise that resolves when the API is redefined
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export async function reDefine(refreshToken: string): Promise<void> {
  if (!refreshToken) {
    return;
  }
  apiInstance = defineOneEntry(PROJECT_URL, {
    token: APP_TOKEN,
    langCode: LANG_CODE,
    auth: {
      saveFunction,
      refreshToken,
    },
  });
}

/**
 * Type guard that narrows an SDK response to `IError`.
 *
 * OneEntry SDK methods return either the requested entity or an `IError` shape
 * (`{ statusCode, message, ... }`). Use at every call site so TypeScript flows
 * the correct type into both branches.
 * @param   {IError | unknown} res - SDK response
 * @returns {boolean}              True if the response is an `IError`
 */
export function isError(res: IError | unknown): res is IError {
  return typeof (res as IError | undefined)?.statusCode === 'number';
}
