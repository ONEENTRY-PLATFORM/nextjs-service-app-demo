'use client';

import type { IError } from 'oneentry/dist/base/utils';
import type { IUserEntity } from 'oneentry/dist/users/usersInterfaces';
import type { JSX, ReactNode } from 'react';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';

import { hasActiveSession, reDefine, syncTokens } from '@/app/api/api/api';
import { useLazyGetMeQuery } from '@/app/api/api/RTKApi';

import { useAppDispatch, useAppSelector } from '../hooks';
import { setCartVersion } from '../reducers/CartSlice';

/**
 * Type definition for the authentication context properties
 */
type ContextProps = {
  isAuth: boolean;
  isLoading: boolean;
  userToken?: string;
  user?: IUserEntity | undefined;
  authenticate: () => void;
  refreshUser: () => void;
  /**
   * Write tokens into the current SDK instance and fetch user data.
   *
   * Call this right after a successful `getApi().AuthProvider.auth()` /
   * `getApi().AuthProvider.signUp()` response. It uses `syncTokens()` to update
   * the existing SDK instance in place — unlike `reDefine()` which creates
   * a fresh instance without an accessToken and causes a 401 on the first
   * user request.
   */
  login: (tokens: {
    accessToken: string;
    refreshToken: string;
    authProviderMarker: string;
  }) => void;
  /**
   * Drop the local auth state after `logOutUser()`.
   *
   * Purely synchronous — unlike `authenticate()` it must NOT re-fetch the
   * user: the tokens are already revoked, so any `getMe` would produce a
   * guaranteed 401 (+ 400 on the retried refresh) in the console.
   */
  logout: () => void;
};

/**
 * Type definition for the authentication provider props
 */
type AuthProviderProps = {
  children: ReactNode;
};

/**
 * React context for managing authentication state throughout the application
 *
 * This context provides authentication-related state and functions to all components
 * in the application tree. It handles user authentication status, loading states,
 * and provides methods for authentication and user data refresh.
 */
export const AuthContext = createContext<ContextProps>({
  isAuth: false,
  isLoading: false,
  authenticate: () => {},
  refreshUser: () => {},
  login: () => {},
  logout: () => {},
});

/**
 * Authentication provider component
 *
 * This component manages the authentication state and provides it to all child components
 * through the AuthContext. It handles token validation, user data fetching, and state updates.
 * @param   {AuthProviderProps} props          - Component properties
 * @param   {ReactNode}         props.children - Child components to be wrapped by the provider
 * @returns {JSX.Element}                      AuthContext.Provider with authentication state and functions
 */
export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
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
         * 401/403"), drop the refresh token ONLY on a genuine auth failure —
         * a transient network error must keep it so polling can retry.
         */
        setIsAuth(false);
        const statusCode = (res.error as IError | undefined)?.statusCode;
        if (statusCode === 401 || statusCode === 403) {
          localStorage.removeItem('refresh-token');
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
    const refresh = localStorage.getItem('refresh-token');

    if (!refresh) {
      setIsAuth(false);
      return;
    }
    if (!hasActiveSession()) {
      /**
       * Restore with the provider the session was created with, so the SDK's
       * proactive refresh hits `/marker/{providerMarker}/users/refresh` for the
       * right provider. Falls back to `email` for sessions saved before the
       * marker was persisted.
       */
      const providerMarker =
        localStorage.getItem('authProviderMarker') || 'email';
      await reDefine(refresh, providerMarker);
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
     * The refresh token is also persisted by the SDK's `saveFunction` during
     * `auth()`; setting it here again is a harmless, explicit belt-and-suspenders
     * (the marker is ours to persist regardless). `syncTokens()` is NOT
     * redundant — it writes the access token straight into the live SDK instance
     * to avoid the 401-on-first-request race that a `reDefine()` would cause
     * (see `api.ts` → `syncTokens`).
     */
    localStorage.setItem('refresh-token', refreshToken);
    localStorage.setItem('authProviderMarker', authProviderMarker);
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

  /**
   * Logout on confirmed auth failure (401 / 403).
   *
   * Polling via `useLazyGetMeQuery` exposes errors only as derived state
   * (`isError` / `error`), not via a callback — so we observe the transition
   * here. State updates are deferred to a microtask so they run outside the
   * effect's synchronous body (avoids React's cascading-render warning).
   *
   * Per `rules/tokens.md` ("Race condition — logout only on confirmed
   * 401/403"), transient network errors must NOT clear the refresh token —
   * polling will retry on its own next tick.
   */
  useEffect(() => {
    if (!isError) return;
    const refresh = localStorage.getItem('refresh-token');
    if (!refresh) return;

    const statusCode = (error as IError | undefined)?.statusCode;
    if (statusCode !== 401 && statusCode !== 403) return;

    queueMicrotask(() => {
      initRef.current = false;
      localStorage.removeItem('refresh-token');
      setIsAuth(false);
    });
  }, [isError, error]);

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
