import type { IMenusEntity } from 'oneentry/types';
import type { JSX } from 'react';

import { getMenuByMarker } from '@/app/api/server/menus/getMenuByMarker';

import BookOnlineLink from './BookOnlineLink';
import MenuButton from './MenuButton';
import NavItemProfile from './NavItemProfile';

/**
 * NavGroup component to render the user navigation group in the header.
 *
 * This component displays the user navigation elements including the desktop
 * booking link, user profile navigation item, and a menu button. It fetches
 * user menu data from the API.
 *
 * The component renders different elements based on screen size:
 * - On medium and larger screens: booking link, profile item, and menu button
 * - On small screens: only the menu button (other items are in the mobile menu)
 *
 * It handles error cases when the user menu cannot be fetched from the API.
 * @returns {Promise<JSX.Element>} JSX.Element representing the user navigation group or error message
 */
const NavGroup = async (): Promise<JSX.Element> => {
  /** Fetch user menu data by marker */
  const { menu, isError } = await getMenuByMarker('user_menu');

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
      <BookOnlineLink variant="desktop" />
      <NavItemProfile {...(userMenu ? { userMenu } : {})} />
      <MenuButton />
    </div>
  );
};

export default NavGroup;
