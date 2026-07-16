'use client';

import Link from 'next/link';
import type { IMenusEntity } from 'oneentry/dist/menus/menusInterfaces';
import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';

import ProfileIcon from '@/components/icons/profile';
import { normalizeMenuPages } from '@/components/normalizeMenuPages';

import ProfileMenuAnimations from '../../animations/ProfileMenuAnimations';
import LogoutMenuItem from './LogoutMenuItem';
import UserMenuItem from './UserMenuItem';

/**
 * User Profile menu component.
 * @param   {object}       props          - The properties for the user profile menu.
 * @param   {IMenusEntity} props.userMenu - Represents a menu object.
 * @returns {JSX.Element}                 JSX.Element representing the user profile menu.
 */
const UserProfileMenu = ({
  userMenu,
}: {
  userMenu: IMenusEntity;
}): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /** Array or single object — see `normalizeMenuPages`. */
  const pages = normalizeMenuPages(userMenu.pages);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      onPointerLeave={() => setIsOpen(false)}
      className="relative flex"
    >
      <Link
        href="/profile"
        onPointerEnter={() => setIsOpen(true)}
        className="group relative my-auto box-border flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-fuchsia-500 bg-fuchsia-500/5 shadow-[0_0_12px_rgba(237,33,241,0.27)]"
      >
        <span className="flex size-5">
          <ProfileIcon active />
        </span>
      </Link>
      <ProfileMenuAnimations
        state={isOpen}
        className="absolute top-8 right-0 h-0 w-48 overflow-hidden rounded-md bg-white px-4 text-slate-800 shadow-lg"
      >
        <ul className="my-4 text-gray-800">
          {pages.map((page, index) => (
            <li key={index}>
              <UserMenuItem page={page} setState={setIsOpen} />
            </li>
          ))}
          <li>
            <LogoutMenuItem />
          </li>
        </ul>
      </ProfileMenuAnimations>
    </div>
  );
};

export default UserProfileMenu;
