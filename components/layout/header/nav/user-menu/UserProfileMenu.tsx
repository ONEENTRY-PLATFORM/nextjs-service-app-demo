'use client';

import Link from 'next/link';
import type {
  IMenusEntity,
  IMenusPages,
} from 'oneentry/dist/menus/menusInterfaces';
import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';

import ProfileIcon from '@/components/icons/profile';

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

  /** Ensure pages are defined and of correct type */
  const pages = (userMenu.pages || []) as IMenusPages[];

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
        className="group relative my-auto box-border flex size-6 shrink-0"
      >
        <ProfileIcon />
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
