'use client';

import Link from 'next/link';
import type { IMenusPages } from 'oneentry/dist/menus/menusInterfaces';
import type { JSX } from 'react';

import { useAppSelector } from '@/app/store/hooks';
import CalendarIcon from '@/components/icons/calendar';

/**
 * Nav item cart button.
 * @param   {object}      props      - Component props
 * @param   {IMenusPages} props.item - menu element object.
 * @returns {JSX.Element}            JSX.Element.
 */
const NavItemCalendar = ({ item }: { item: IMenusPages }): JSX.Element => {
  /** Get service count from cart reducer for badge display */
  const cartCount = useAppSelector((state) => {
    return state.cartReducer.servicesData?.length;
  });

  /** Extract page URL and localized information from menu item */
  const { pageUrl, localizeInfos } = item;

  /** Render calendar navigation item with cart count badge */
  return (
    <Link
      prefetch={false}
      href={'/' + pageUrl}
      title={localizeInfos?.menuTitle ?? undefined}
      className="group relative box-border flex size-6 shrink-0 flex-col"
    >
      {/** Display calendar icon */}
      <CalendarIcon />
      {/** Show cart count badge when services are added */}
      {cartCount && (
        <div className="absolute top-1 right-1 z-10 size-4 rounded-full bg-fuchsia-500 text-center text-sm leading-4">
          {cartCount}
        </div>
      )}
    </Link>
  );
};

export default NavItemCalendar;
