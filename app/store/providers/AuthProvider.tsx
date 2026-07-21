'use client';

import type { IUserEntity } from 'oneentry/dist/users/usersInterfaces';
import type { JSX, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  clearSession,
  hasActiveSession,
  reDefine,
  syncTokens,
} from '@/app/api/api/api';
import { useLazyGetMeQuery } from '@/app/api/api/RTKApi';
import {
  clearAuthSession,
  readAuthProviderMarker,
  readRefreshToken,
  saveAuthSession,
} from '@/app/store/auth/authStorage';
import { isRefreshTokenExpired } from '@/app/store/auth/isRefreshTokenExpired';
import {
  isAuthFailure,
  useLogoutOnAuthFailure,
} from '@/app/store/auth/useLogoutOnAuthFailure';

import { useAppDispatch, useAppSelector } from '../hooks';
import { setCartVersion } from '../reducers/CartSlice';
import { AuthContext } from './AuthContext';

/**
 * Authentication provider component
 *
 * This component manages the authentication state and provides it to all child components
 * through the {@link AuthContext}. It handles token validation, user data fetching, and
 * state updates.
 * @param   {object}      props          - Component properties
 * @param   {ReactNode}   props.children - Child components to be wrapped by the provider
 * @returns {JSX.Element}                AuthContext.Provider with authentication state and functions
 */
export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const dispatch = useAppDispatch();
  const [isAuth, setIsAuth] = useState<boolean>(false);
  /**
   * Starts `true`: until `onInit()` has probed the stored refresh token the auth
   * state is unknown, not "signed out". Auth-gated pages must show a neutral
   * placeholder during this window instead of flashing their signed-out screen
   * (e.g. the profile page's 401 AuthError). `onInit` flips it to `false` — for
   * a guest almost immediately (no refresh token → early return).
   */
  const [isLoading, setIsLoading] = useState<boolean>(true);
  /**
   * `user` is kept in local state ON PURPOSE — not read from the getMe hook's
   * `data`, which `rule:performance-rtk` would normally prefer. The hook polls
   * every 60s (session keepalive, below); reading `data` directly would
   * re-render every AuthContext consumer on each poll. Instead the user is
   * snapshotted only on the explicit `checkToken()` transitions (init / login /
   * refetch), decoupling the exposed user from the keepalive traffic. `getMe`
   * keeps a single subscriber, so RTK's dedup/caching is unaffected.
   */
  const [user, setUser] = useState<IUserEntity | undefined>();
  const [refetch, setRefetch] = useState<boolean>(false);
  const [refetchUser, setRefetchUser] = useState<boolean>(false);

  /**
   * Get user data from redux AppSelector
   */
  const cartVersion = useAppSelector((state) => state.cartReducer.version);

  /**
   * StrictMode guard — React runs init effects twice in dev. Two concurrent
   * `reDefine()` calls would fire two `/refresh` requests; the refresh token
   * is one-time, so the second fails and triggers a spurious logout.
   */
  const initRef = useRef(false);

  /**
   * Session keepalive poll. 60s per the RTK rule — a few-second interval is
   * dozens of `getMe` round-trips per minute per tab for no real benefit; a
   * minute is plenty to notice a revoked/expired session. Disabled when signed
   * out (`0`).
   */
  const [trigger, { isError, error }] = useLazyGetMeQuery({
    pollingInterval: isAuth ? 60000 : 0,
  });

  /**
   * Check refresh token and validate user authentication.
   * Memoized — `trigger` from RTK Query is the only non-stable dep.
   */
  const checkToken = useCallback(async () => {
    trigger()
      .then(async (res) => {
        if (res.data?.id) {
          setUser(res.data);
          setIsAuth(true);
          return;
        }
        /**
         * No user data. Per `rules/tokens.md` ("logout only on confirmed
         * 401/403"), drop the stored session ONLY on a genuine auth failure —
         * a transient network error must keep it so polling can retry.
         */
        setIsAuth(false);
        if (isAuthFailure(res.error)) {
          /**
           * Drop the dead token from BOTH places. `clearAuthSession()` only
           * clears `localStorage`; the live SDK instance (built by `reDefine()`
           * during session restore) keeps the revoked refresh token in its
           * state and proactively retries `POST /users/refresh` before every
           * later user-scoped request, so each one costs an extra 400.
           */
          clearAuthSession();
          clearSession();
        }
      })
      .catch(async () => {
        /** Unexpected/network rejection — keep the token, just mark not-authed */
        setIsAuth(false);
      });
  }, [trigger]);

  /**
   * Restore the session from `localStorage` on page load. Only calls
   * `reDefine()` if the SDK does not already hold an access token — this is
   * the single valid use of `reDefine()` (session restore), not login.
   */
  const onInit = useCallback(async () => {
    const refresh = readRefreshToken();

    if (!refresh) {
      setIsAuth(false);
      return;
    }
    /**
     * A token past the provider's TTL cannot be refreshed, and probing it costs
     * a guaranteed 400 (`/users/refresh`) plus a 401 (`/users/me`) on every
     * load. Drop it locally and start as a guest instead.
     */
    if (isRefreshTokenExpired(refresh)) {
      clearAuthSession();
      setIsAuth(false);
      return;
    }
    if (!hasActiveSession()) {
      /**
       * Restore with the provider the session was created with, so the SDK's
       * proactive refresh hits `/marker/{providerMarker}/users/refresh` for the
       * right provider.
       */
      await reDefine(refresh, readAuthProviderMarker());
    }
    await checkToken();
  }, [checkToken]);

  /**
   * Log the user in after a successful `auth()` / `signUp()` response.
   *
   * Writes tokens directly into the current SDK instance via `syncTokens()`
   * (avoids the 401-on-first-request race that `reDefine()` causes) and
   * persists the refresh token + provider marker so the session can be
   * restored after a page reload.
   * @param {object} tokens                    - token bundle from the auth response
   * @param {string} tokens.accessToken        - short-lived access token
   * @param {string} tokens.refreshToken       - long-lived refresh token
   * @param {string} tokens.authProviderMarker - provider marker (e.g. 'email')
   */
  const login = ({
    accessToken,
    refreshToken,
    authProviderMarker,
  }: {
    accessToken: string;
    refreshToken: string;
    authProviderMarker: string;
  }): void => {
    /**
     * `syncTokens()` is NOT redundant with the persisted session — it writes the
     * access token straight into the live SDK instance to avoid the
     * 401-on-first-request race that a `reDefine()` would cause (see `api.ts` →
     * `syncTokens`).
     */
    saveAuthSession({ refreshToken, authProviderMarker });
    syncTokens(accessToken, refreshToken);
    setIsAuth(true);
    void checkToken();
  };

  /**
   * Legacy cart-sync stub — NOT a real cart loader, despite the old name.
   *
   * The `user.state.cart` → Redux hydration was never finished: this effect only
   * flips a one-shot `cartVersion` flag the first time a signed-in user has a
   * server cart, and nothing reads that flag except this same gate. The live
   * cart runs entirely on Redux + redux-persist (`CartSlice`); the writing side
   * (`updateUserState` / `useUpdateUserStateMutation`) is defined but never
   * called from anywhere. Kept, not deleted, per project convention — revisit
   * when the native cart API is wired up or the dead path is dropped on purpose.
   */
  useEffect(() => {
    if (!user?.state.cart || cartVersion > 0) {
      return;
    }
    dispatch(setCartVersion(1));
  }, [isAuth, user, cartVersion, dispatch]);

  /**
   * Refetch — StrictMode-safe init. In React 18 dev, this effect runs twice;
   * the ref guard ensures `onInit()` runs exactly once per real mount.
   */
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    setIsLoading(true);
    onInit()
      .catch(() => {
        /**
         * A failed probe (network / SDK reject in `reDefine` or `checkToken`)
         * must not strand the whole app in the loading state. Treat it like the
         * no-refresh-token branch — the user is simply not authenticated — and
         * let the UI recover.
         */
        setIsAuth(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [refetch, onInit]);

  /** End the session when the keepalive poll confirms a 401 / 403. */
  useLogoutOnAuthFailure({
    isError,
    error,
    onAuthFailure: () => {
      initRef.current = false;
      clearAuthSession();
      /** Same reason as in `checkToken()` — the SDK instance holds it too. */
      clearSession();
      setIsAuth(false);
    },
  });

  /** Check token on refetch */
  useEffect(() => {
    if (isAuth) {
      checkToken();
    }
    // isAuth intentionally omitted — we only want to re-check when the user
    // explicitly toggles refetch/refetchUser, not on every auth-state change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch, refetchUser, checkToken]);

  /**
   * Drop the local auth state right after `logOutUser()`. Synchronous by
   * design: the tokens are already revoked, so re-fetching the user (as
   * `authenticate()` does) would only produce a guaranteed 401/400 pair in
   * the console. Flipping `isAuth` also stops the getMe polling immediately.
   */
  const logout = (): void => {
    initRef.current = false;
    setUser(undefined);
    setIsAuth(false);
  };

  const value = {
    isAuth,
    isLoading,
    user,
    authenticate: () => {
      initRef.current = false;
      setRefetch(!refetch);
    },
    refreshUser: () => setRefetchUser(!refetchUser),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
