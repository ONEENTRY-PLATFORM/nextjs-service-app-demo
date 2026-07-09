'use client';

import Link from 'next/link';
import type { IMenusPages } from 'oneentry/dist/menus/menusInterfaces';
import type { JSX } from 'react';

import HomeIcon from '@/components/icons/home';

/**
 * Home navItem menu element.
 * @param   {object}      props      - Props object.
 * @param   {IMenusPages} props.item menu element object.
 * @returns {JSX.Element}            JSX.Element
 */
const NavItemHome = ({
  item: { localizeInfos },
}: {
  item: IMenusPages;
}): JSX.Element => {
  /** Render home navigation item with link and icon */
  return (
    <Link
      href={'/'}
      prefetch={false}
      title={localizeInfos.menuTitle ?? undefined}
      className="group relative box-border flex size-6 shrink-0 flex-col"
    >
      <HomeIcon />
    </Link>
  );
};

export default NavItemHome;
