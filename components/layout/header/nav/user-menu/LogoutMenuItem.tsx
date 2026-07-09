'use client';

import { useTransitionRouter } from 'next-transition-router';
import type { JSX } from 'react';
import { useContext } from 'react';

import { logOutUser } from '@/app/api';
import { AuthContext } from '@/app/store/providers/AuthContext';

/**
 * Logout menu item button.
 * @returns {JSX.Element} JSX.Element representing a logout menu item button.
 */
const LogoutMenuItem = (): JSX.Element => {
  const { authenticate } = useContext(AuthContext);
  const router = useTransitionRouter();

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await logOutUser({ marker: 'email' });
      authenticate();
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
