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
  const { book_text } = dict;

  /**
   * The user menu is optional decoration on the profile icon — if it fails to
   * load, the core actions (Book Online, profile, hamburger) must stay visible
   * rather than collapsing the whole group into an error message.
   */
  const userMenu = !isError && menu ? (menu as IMenusEntity) : undefined;
  /**
   * Render navigation group: the Book Online pill and profile icon stay visible
   * at every width (compact on mobile, as in the mock's header), followed by the
   * hamburger trigger on <lg.
   */
  return (
    <div className="my-auto flex items-center gap-2 fade-in max-md:max-w-full sm:gap-4">
      <Link
        href="/booking/"
        className="h-auto justify-center self-center rounded-xl bg-gradient-brand px-4 py-3 text-sm leading-6 font-bold tracking-wide whitespace-nowrap text-white uppercase shadow-[0_4px_16px_rgba(237,33,241,0.27)] transition duration-300 ease-in-out outline-none hover:opacity-90 focus:opacity-90 focus:outline-none disabled:bg-neutral-300/50 md:px-6 md:text-base"
      >
        {(book_text?.value as string | undefined) || 'Book Online'}
      </Link>
      <NavItemProfile {...(userMenu ? { userMenu } : {})} />
      <MenuButton />
    </div>
  );
};

export default NavGroup;
