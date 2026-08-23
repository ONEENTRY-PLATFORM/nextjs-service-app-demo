'use client';

import Link from 'next/link';
import type { IMenusPages } from 'oneentry/types';
import type { JSX } from 'react';

import { useAppSelector } from '@/app/store/hooks';
import { selectFilledCartCount } from '@/app/store/reducers/CartSlice';
import { useHydrated } from '@/app/store/useHydrated';
import CalendarIcon from '@/components/icons/calendar';

/**
 * Nav item cart button.
 * @param   {object}      props      - Component props
 * @param   {IMenusPages} props.item - menu element object.
 * @returns {JSX.Element}            JSX.Element.
 */
const NavItemCalendar = ({ item }: { item: IMenusPages }): JSX.Element => {
  /**
   * Rows the user actually picked something into — the old
   * `servicesData.length` was a constant 1, so the badge showed "1" even for an
   * empty cart (see {@link selectFilledCartCount}).
   */
  const cartCount = useAppSelector(selectFilledCartCount);

  /**
   * The count above now genuinely differs between server and client — the cart
   * is `redux-persist` state, so the server always counts 0 while a returning
   * client counts its saved selections. Rendering that on the hydration pass
   * would make the tree differ from the server HTML ("Hydration failed"), so
   * the badge appears one commit later. (Before the count was fixed this gate
   * was unnecessary: the old `servicesData.length` was a constant 1 on both
   * sides, and gating it would only have made the badge flash.)
   */
  const hydrated = useHydrated();
  const badgeCount = hydrated ? cartCount : 0;

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
      <CalendarIcon />
      {badgeCount > 0 && (
        <div className="absolute top-1 right-1 z-10 size-4 rounded-full bg-fuchsia-500 text-center text-sm leading-4">
          {badgeCount}
        </div>
      )}
    </Link>
  );
};

export default NavItemCalendar;
