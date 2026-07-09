'use client';

import Link from 'next/link';
import type { IMenusPages } from 'oneentry/dist/menus/menusInterfaces';
import type { JSX } from 'react';

import BookingIcon from '@/components/icons/booking';

/**
 * NavItemBooking.
 * @param   {object}      props      - item object.
 * @param   {IMenusPages} props.item - item.
 * @returns {JSX.Element}            JSX.Element.
 */
const NavItemBooking = ({ item }: { item: IMenusPages }): JSX.Element => {
  const { pageUrl, localizeInfos } = item;

  return (
    <Link
      prefetch={false}
      href={'/' + pageUrl}
      title={localizeInfos.menuTitle ?? undefined}
      className="group relative box-border flex size-6 shrink-0 flex-col"
    >
      <BookingIcon />
    </Link>
  );
};

export default NavItemBooking;
