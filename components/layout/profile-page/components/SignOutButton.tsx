'use client';

import { LogOut } from 'lucide-react';
import { useTransitionRouter } from 'next-transition-router';
import type { JSX } from 'react';
import { useContext } from 'react';

import { logOutUser } from '@/app/api';
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

  /** Handle user logout, then navigate to the home page. */
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
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-fuchsia-500 transition-colors hover:bg-fuchsia-500/10"
    >
      <LogOut size={18} /> {label}
    </button>
  );
};

export default SignOutButton;
