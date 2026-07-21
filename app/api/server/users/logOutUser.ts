'use client';

import { clearSession, getApi } from '@/app/api/api/api';
import {
  clearAuthSession,
  readRefreshToken,
} from '@/app/store/auth/authStorage';

type LogOutProps = { marker: string; token?: string };

/**
 * logOutUser — revoke the session with `AuthProvider.logout` and clear it locally.
 *
 * ⚠️ CLIENT-ONLY, despite living under `app/api/server/`. That directory is the
 * project's convention for every SDK wrapper (see CLAUDE.md), not a claim about
 * where the code runs — and this one reads `localStorage`, so calling it from a
 * Server Component throws `ReferenceError: localStorage is not defined`. The
 * `'use client'` directive above makes that explicit instead of leaving it to
 * whoever reads the path. Both real call sites (`SignOutButton`,
 * `LogoutMenuItem`) are already client components.
 *
 * User-authorized SDK methods must run on the client anyway: the API ties the
 * refresh token to the browser fingerprint (rules/auth-provider.md).
 *
 * NEVER THROWS — the SDK error is caught and returned as `{ error }`, and the
 * local session is always dropped in `finally` (even on failure). Callers do
 * not need a `try/catch` around it; a rejection is not a possible outcome.
 * @param   {LogOutProps}     props        - Function parameters
 * @param   {string}          props.marker - Auth-provider marker the user signed in with (e.g. `'email'`)
 * @returns {Promise<object>}              `{ data }` on success, `{ error }` with the message on failure — always resolves
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const logOutUser = async ({ marker }: LogOutProps): Promise<object> => {
  try {
    const token = readRefreshToken();
    if (!token) {
      throw Error('No token provided');
    }
    const result = await getApi().AuthProvider.logout(marker, token);
    return { data: result };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  } finally {
    /**
     * The local session must die even when the server call fails (the token
     * may already be revoked/expired). Without this the revoked refresh token
     * stays in localStorage and in the SDK state, and the SDK retries it
     * before every request — endless 400/401 noise (rules/tokens.md).
     */
    clearAuthSession();
    clearSession();
  }
};
