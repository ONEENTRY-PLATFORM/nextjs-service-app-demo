import type { IMenusPages } from 'oneentry/dist/menus/menusInterfaces';
import type { JSX } from 'react';
import { type Key } from 'react';

import { getMenuByMarker } from '@/app/api';
import { normalizeMenuPages } from '@/components/normalizeMenuPages';

import NavItemBooking from './components/NavItemBooking';
import NavItemCalendar from './components/NavItemCalendar';
import NavItemCatalog from './components/NavItemCatalog';
import NavItemHome from './components/NavItemHome';
import NavItemProfile from './components/NavItemProfile';

/**
 * Bottom menu for mobile devices.
 * @returns {Promise<JSX.Element>} bottom mobile menu JSX.Element.
 */
const BottomMobileMenu = async (): Promise<JSX.Element | null> => {
  /** Get Menu by marker from api */
  const { menu, isError } = await getMenuByMarker('bottom_web');

  /**
   * The `bottom_web` menu is not filled in the CMS. Without items the fixed bar
   * would render as an empty white strip at the bottom on mobile, so render
   * nothing until the menu exists (the header already carries Book/Profile).
   */
  const pages = normalizeMenuPages(menu?.pages);
  if (isError || !menu || pages.length < 1) {
    return null;
  }

  return (
    <div className="fixed bottom-0 z-500 my-auto hidden h-15 w-full items-center justify-between gap-10 bg-white p-4 max-md:flex">
      {pages.map((item: IMenusPages, i: Key) => {
        return (
          <div className="flex size-6" key={i}>
            {item.pageUrl === 'home' && <NavItemHome item={item} />}
            {item.pageUrl === 'services' && <NavItemCatalog item={item} />}
            {item.pageUrl === 'booking' && <NavItemBooking item={item} />}
            {item.pageUrl === 'masters' && <NavItemCalendar item={item} />}
            {item.pageUrl === 'profile' && <NavItemProfile item={item} />}
          </div>
        );
      })}
    </div>
  );
};

export default BottomMobileMenu;
