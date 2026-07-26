'use client';

import type { IUserEntity } from 'oneentry/dist/users/usersInterfaces';
import { createContext } from 'react';

/**
 * Type definition for the authentication context properties
 * @property {boolean}                  isAuth       - A user session is active
 * @property {boolean}                  isLoading    - The initial token check is still in flight
 * @property {string}                   [userToken]  - Access token of the active session
 * @property {IUserEntity}              [user]       - The authenticated user entity
 * @property {() => void}               authenticate - Re-run the token check and re-fetch the user
 * @property {() => void}               refreshUser  - Re-fetch the user entity of the active session
 * @property {(tokens: object) => void} login        - Write tokens (`accessToken`, `refreshToken`,
 *                                                   `authProviderMarker`) into the current SDK instance and fetch user data. Call this right after a
 *                                                   successful `getApi().AuthProvider.auth()` / `getApi().AuthProvider.signUp()` response. It uses
 *                                                   `syncTokens()` to update the existing SDK instance in place — unlike `reDefine()` which creates
 *                                                   a fresh instance without an accessToken and causes a 401 on the first user request.
 * @property {() => void}               logout       - Drop the local auth state after `logOutUser()`.
 *                                                   Purely synchronous — unlike `authenticate()` it must NOT re-fetch the user: the tokens are
 *                                                   already revoked, so any `getMe` would produce a guaranteed 401 (+ 400 on the retried refresh)
 *                                                   in the console.
 */
export type ContextProps = {
  isAuth: boolean;
  isLoading: boolean;
  userToken?: string;
  user?: IUserEntity | undefined;
  authenticate: () => void;
  refreshUser: () => void;
  login: (tokens: {
    accessToken: string;
    refreshToken: string;
    authProviderMarker: string;
  }) => void;
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
