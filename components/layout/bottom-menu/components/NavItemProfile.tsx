'use client';

import Link from 'next/link';
import type { IMenusPages } from 'oneentry/dist/menus/menusInterfaces';
import type { JSX } from 'react';
import { useContext } from 'react';

import { AuthContext } from '@/app/store/providers/AuthContext';
import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import ProfileIcon from '@/components/icons/profile';

/**
 * Nav item profile link / SignInForm button.
 * @param   {object}      props      - menu item data.
 * @param   {IMenusPages} props.item - menu item.
 * @returns {JSX.Element}            JSX.Element.
 */
const NavItemProfile = ({ item }: { item: IMenusPages }): JSX.Element => {
  /** Access drawer context to control drawer state and component display */
  const { open, setOpen, setComponent } = useContext(OpenDrawerContext);
  /** Check user authentication status from auth context */
  const { isAuth } = useContext(AuthContext);
  /** Extract title from item's localized information with fallback */
  const title = item.localizeInfos?.menuTitle || item.localizeInfos?.title;

  /** Render profile navigation item based on authentication status */
  return !isAuth ? (
    <button
      onClick={() => {
        setOpen(!open);
        setComponent('SignInForm');
      }}
      title={title}
      className="group relative box-border flex size-6 shrink-0"
    >
      <ProfileIcon />
    </button>
  ) : (
    <Link
      prefetch={false}
      href={'/profile'}
      title={title}
      className="group relative box-border flex size-6 shrink-0"
    >
      <ProfileIcon />
    </Link>
  );
};

export default NavItemProfile;
