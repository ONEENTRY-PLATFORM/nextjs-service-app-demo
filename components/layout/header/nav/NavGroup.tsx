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
          className="h-auto justify-center self-center rounded-md bg-fuchsia-500 px-5 py-1.5 text-sm leading-6 text-white uppercase transition duration-500 ease-in-out outline-none hover:bg-fuchsia-600 focus:bg-fuchsia-600 focus:outline-none disabled:bg-neutral-300/50"
        >
          {book_text?.value as string}
        </Link>
        <NavItemProfile userMenu={menu as IMenusEntity} />
      </div>
      <MenuButton />
    </div>
  );
};

export default NavGroup;
