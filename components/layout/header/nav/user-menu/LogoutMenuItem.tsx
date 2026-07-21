'use client';

import { useRouter } from 'next/navigation';
import type { JSX } from 'react';
import { useContext } from 'react';

import { logOutUser } from '@/app/api/server/users/logOutUser';
import { readAuthProviderMarker } from '@/app/store/auth/authStorage';
import { AuthContext } from '@/app/store/providers/AuthContext';

/**
 * Logout menu item button.
 * @returns {JSX.Element} JSX.Element representing a logout menu item button.
 */
const LogoutMenuItem = (): JSX.Element => {
  const { logout } = useContext(AuthContext);
  /**
   * Plain Next router, NOT `useTransitionRouter`.
   *
   * The header is mounted OUTSIDE `<TransitionProvider>` (`app/layout.tsx`), so
   * `useTransitionRouter()` here resolves to the library's DEFAULT context,
   * whose `navigate` is a no-op — the post-logout redirect silently did
   * nothing and the visitor stayed on the private page they just signed out of.
   * Header *links* are unaffected: the provider delegates `a[href]` clicks at
   * the document level, so they still animate.
   */
  const router = useRouter();

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      // Log out through the provider the user actually signed in with, which
      // AuthProvider.login persisted (with the legacy 'email' fallback).
      const marker = readAuthProviderMarker();
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
      data-testid="logout-button"
    >
      <div>Logout</div>
    </button>
  );
};

export default LogoutMenuItem;
