import Link from 'next/link';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IMenusEntity } from 'oneentry/dist/menus/menusInterfaces';
import type { JSX } from 'react';

import { getMenuByMarker } from '@/app/api';
import { ServerProvider } from '@/app/store/providers/ServerProvider';

import MenuButton from './MenuButton';
import NavItemProfile from './NavItemProfile';

/**
 * NavGroup component to render the user navigation group in the header.
 *
 * This component displays the user navigation elements including a booking link,
 * user profile navigation item, and a menu button. It fetches user menu data
 * from the API and uses server-provided dictionary values for localization.
 *
 * The component renders different elements based on screen size:
 * - On medium and larger screens: booking link, profile item, and menu button
 * - On small screens: only the menu button (other items are in the mobile menu)
 *
 * It handles error cases when the user menu cannot be fetched from the API.
 * @returns {Promise<JSX.Element>} JSX.Element representing the user navigation group or error message
 */
const NavGroup = async (): Promise<JSX.Element> => {
  /** Fetch dictionary data for localization */
  const [dict] = ServerProvider<IAttributeValues>('dict');
  /** Fetch user menu data by marker */
  const { menu, isError } = await getMenuByMarker('user_menu');
  /** Extract specific text values from dictionary */
  const { book_text, menu_not_found_text } = dict;

  /** Display error message if menu data is not available */
  if (!menu || isError) {
    return <p>{menu_not_found_text?.value as string}</p>;
  }
  /** Render navigation group with booking link, profile item and mobile menu button */
  return (
    <div className="my-auto flex items-center gap-4 fade-in max-md:max-w-full">
      <div className="hidden gap-4 max-md:gap-4 max-sm:gap-2 md:flex">
        <Link
          href="/booking/"
          className="h-auto justify-center self-center rounded-xl bg-gradient-brand px-6 py-3 text-base leading-6 font-bold tracking-wide text-white uppercase shadow-[0_4px_16px_rgba(237,33,241,0.27)] transition duration-300 ease-in-out outline-none hover:opacity-90 focus:opacity-90 focus:outline-none disabled:bg-neutral-300/50"
        >
          {(book_text?.value as string | undefined) || 'Book Online'}
        </Link>
        <NavItemProfile userMenu={menu as IMenusEntity} />
      </div>
      <MenuButton />
    </div>
  );
};

export default NavGroup;
