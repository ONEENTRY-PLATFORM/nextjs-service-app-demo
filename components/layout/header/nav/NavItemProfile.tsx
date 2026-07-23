'use client';

import Link from 'next/link';
import type { IMenusEntity } from 'oneentry/dist/menus/menusInterfaces';
import type { JSX } from 'react';
import { useContext } from 'react';

import { AuthContext } from '@/app/store/providers/AuthContext';
import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import { useDict } from '@/app/store/providers/useDict';
import ProfileIcon from '@/components/icons/profile';
import { prefetchPopup } from '@/components/layout/prefetchPopup';

import UserProfileMenu from './user-menu/UserProfileMenu';

/**
 * NavItemProfile component to render either a sign-in button or user profile link/menu.
 *
 * This component conditionally renders different elements based on the user's authentication state:
 * - For unauthenticated users: a sign-in button that opens the sign-in form in a drawer
 * - For authenticated users: either a user profile menu (if userMenu data is provided) or a link to the profile page
 * @param   {object}       props          - Component properties
 * @param   {IMenusEntity} props.userMenu - Optional menu entity for authenticated users
 * @returns {JSX.Element}                 JSX.Element representing either a sign-in button or user profile navigation element
 */
const NavItemProfile = ({
  userMenu,
}: {
  userMenu?: IMenusEntity;
}): JSX.Element => {
  /** Get drawer state and control functions from context */
  const { open, setOpen, setComponent } = useContext(OpenDrawerContext);
  /** Check user authentication status from context */
  const { isAuth } = useContext(AuthContext);
  /** UI-text dictionary for the localized aria-labels */
  const dict = useDict();

  /** Handle sign in button click to open sign in form in drawer */
  const handleSignInClick = () => {
    setOpen(!open);
    setComponent('SignInForm');
  };

  /** Render sign in button when user is not authenticated */
  if (!isAuth) {
    return (
      <button
        onClick={handleSignInClick}
        onPointerEnter={() => prefetchPopup('SignInForm')}
        onFocus={() => prefetchPopup('SignInForm')}
        className="group relative my-auto box-border flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-[#d0d0dc] transition-transform duration-200 hover:scale-108 active:scale-94"
        aria-label={
          (dict?.sign_in_text?.value as string | undefined) || 'Sign In'
        }
      >
        <span className="flex size-4.75">
          <ProfileIcon />
        </span>
      </button>
    );
  }

  /** Render user profile menu when user is authenticated and menu data exists */
  if (userMenu) {
    return <UserProfileMenu userMenu={userMenu} />;
  }

  /** Render profile link when user is authenticated but no menu data */
  return (
    <Link
      prefetch={false}
      href="/profile"
      className="group relative my-auto box-border flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-fuchsia-500 bg-fuchsia-500/6 shadow-[0_0_12px_rgba(237,33,241,0.27)] transition-transform duration-200 hover:scale-108 active:scale-94"
      aria-label={
        (dict?.profile_aria?.value as string | undefined) || 'Profile'
      }
    >
      <span className="flex size-4.75">
        <ProfileIcon active />
      </span>
    </Link>
  );
};

export default NavItemProfile;
