'use client';

import { useTransitionRouter } from 'next-transition-router';
import type { JSX } from 'react';
import { useContext } from 'react';

import { logOutUser } from '@/app/api/server/users/logOutUser';
import { AuthContext } from '@/app/store/providers/AuthContext';

/**
 * Logout menu item button.
 * @returns {JSX.Element} JSX.Element representing a logout menu item button.
 */
const LogoutMenuItem = (): JSX.Element => {
  const { logout } = useContext(AuthContext);
  const router = useTransitionRouter();

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      // Log out through the provider the user actually signed in with, which
      // AuthContext.login persisted; 'email' is the fallback for legacy
      // sessions saved before the marker was stored.
      const marker = localStorage.getItem('authProviderMarker') ?? 'email';
      await logOutUser({ marker });
      logout();
      router.push('/');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error logging out:', error);
    }
  };

  return (
    <button
      className="group flex justify-start p-2 text-slate-800 hover:text-fuchsia-500"
      onClick={handleLogout}
    >
      <div>Logout</div>
    </button>
  );
};

export default LogoutMenuItem;
