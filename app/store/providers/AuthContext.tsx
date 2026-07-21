'use client';

import type { IUserEntity } from 'oneentry/dist/users/usersInterfaces';
import { createContext } from 'react';

/**
 * Type definition for the authentication context properties
 */
export type ContextProps = {
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
 * React context for managing authentication state throughout the application
 *
 * This context provides authentication-related state and functions to all components
 * in the application tree. It handles user authentication status, loading states,
 * and provides methods for authentication and user data refresh.
 *
 * The value is supplied by `AuthProvider`; the defaults below are what a
 * consumer mounted outside the provider sees.
 */
export const AuthContext = createContext<ContextProps>({
  isAuth: false,
  isLoading: false,
  authenticate: () => {},
  refreshUser: () => {},
  login: () => {},
  logout: () => {},
});
