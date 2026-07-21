'use client';

import { LogOut } from 'lucide-react';
import { useTransitionRouter } from 'next-transition-router';
import type { JSX } from 'react';
import { useContext } from 'react';

import { logOutUser } from '@/app/api/server/users/logOutUser';
import { readAuthProviderMarker } from '@/app/store/auth/authStorage';
import { AuthContext } from '@/app/store/providers/AuthContext';

/**
 * SignOutButton logs the user out (via the same flow as the header menu) and
 * redirects home. Rendered in the profile card header as a pink text button.
 * @param   {object}      props         - Component props
 * @param   {string}      [props.label] - Button label (defaults to "Sign out")
 * @returns {JSX.Element}               Sign-out button element
 */
const SignOutButton = ({
  label = 'Sign out',
}: {
  label?: string | undefined;
}): JSX.Element => {
  /** Auth context drops the local session state after logout. */
  const { logout } = useContext(AuthContext);
  /** Transition-aware router for the post-logout redirect. */
  const router = useTransitionRouter();

  /**
   * handleLogout — sign the user out through the provider they signed in with,
   * drop the local session state and redirect home.
   * @returns {Promise<void>} Resolves once logout + redirect are dispatched
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
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-fuchsia-500 transition-colors hover:bg-fuchsia-500/10"
    >
      <LogOut size={18} /> {label}
    </button>
  );
};

export default SignOutButton;
