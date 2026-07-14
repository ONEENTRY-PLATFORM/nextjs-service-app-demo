'use client';

import type { IError } from 'oneentry/dist/base/utils';
import type { IUserEntity } from 'oneentry/dist/users/usersInterfaces';
import type { JSX, ReactNode } from 'react';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';

import {
  hasActiveSession,
  reDefine,
  syncTokens,
  useLazyGetMeQuery,
} from '@/app/api';

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
   * Check user data loop
   */
  const [trigger, { isError, error }] = useLazyGetMeQuery({
    pollingInterval: isAuth ? 3000 : 0,
  });

  /**
   * Check refresh token and validate user authentication.
   * Memoized — `trigger` from RTK Query is the only non-stable dep.
   */
  const checkToken = useCallback(async () => {
    trigger()
      .then(async (res) => {
        if ((res.isError && !res.isLoading) || !res.data?.id) {
          localStorage.removeItem('refresh-token');
          setIsAuth(false);
        } else {
          setUser(res.data);
          setIsAuth(true);
        }
      })
      .catch(async () => {
        localStorage.removeItem('refresh-token');
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
      await reDefine(refresh);
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
    localStorage.setItem('refresh-token', refreshToken);
    localStorage.setItem('authProviderMarker', authProviderMarker);
    syncTokens(accessToken, refreshToken);
    setIsAuth(true);
    void checkToken();
  };

  /** Load cart from user state */
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
    onInit().then(() => {
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
