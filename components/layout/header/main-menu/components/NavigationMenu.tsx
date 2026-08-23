import Link from 'next/link';
import type { IMenusPages } from 'oneentry/types';
import type { JSX } from 'react';

// import MenuAnimations from '../../animations/MenuAnimations';
import NavUnderline from '../animations/NavUnderline';
import NavigationMenuItem from './NavigationMenuItem';

/**
 * Route of a top level menu item.
 * @param   {IMenusPages} item - Menu item from OneEntry CMS
 * @returns {string}           Href for the item, `/` for the home page
 */
const menuHref = (item: IMenusPages): string =>
  `/${item.pageUrl && item.pageUrl !== 'home' ? item.pageUrl : ''}`;

/**
 * Main navigation menu component.
 *
 * This component renders the primary navigation menu for the site using data
 * from the OneEntry CMS. It handles both top-level menu items and their
 * dropdown children. The menu is hidden on mobile devices and shown on
 * larger screens (lg breakpoint and above).
 *
 * For menu items with children, it creates dropdown menus that appear on hover.
 * Each child item is linked to a specific page URL constructed from the parent
 * and child page URLs.
 *
 * The active item is not underlined by the item itself: the list is wrapped in
 * `NavUnderline`, which owns a single bar and flows it between the items on
 * hover. It needs the hrefs in the same order as the rendered items.
 * @param   {object}        props      - Component properties
 * @param   {IMenusPages[]} props.menu - Array of menu items representing the site navigation structure
 * @returns {JSX.Element}              JSX.Element representing the main navigation menu
 */
const NavigationMenu = ({ menu }: { menu: IMenusPages[] }): JSX.Element => {
  return (
    <nav
      className="hidden text-slate-400 fade-in lg:flex"
      data-testid="main-nav"
    >
      <NavUnderline
        hrefs={menu.map(menuHref)}
        className="flex flex-row flex-wrap items-center gap-8"
      >
        {menu.map((item, index) => {
          const hasChildren =
            Array.isArray(item.children) && item.children.length > 0;
          return (
            <li key={index} className={hasChildren ? 'group' : ''}>
              <NavigationMenuItem
                label={
                  item.localizeInfos?.menuTitle ||
                  item.localizeInfos?.title ||
                  ''
                }
                href={menuHref(item)}
                hasDropdown={hasChildren}
              />
              {Array.isArray(item.children) && item.children.length > 0 && (
                <ul className="fixed z-50 hidden flex-col overflow-hidden rounded-b-2xl bg-white p-6 leading-8 shadow-lg group-hover:flex">
                  {item.children
                    .filter((child) => child.pageUrl)
                    .map((child, childIndex) => (
                      <li key={childIndex} className="menu-item px-4">
                        <Link
                          prefetch={false}
                          href={`/${item.pageUrl}/${child.pageUrl}`}
                          className="flex w-full py-2 text-neutral-500 uppercase transition-colors duration-300 ease-in-out hover:text-fuchsia-500 focus:text-fuchsia-500 focus:outline-none"
                          data-testid="main-nav-sublink"
                          data-menu-url={`${item.pageUrl}/${child.pageUrl}`}
                        >
                          {child.localizeInfos?.menuTitle ||
                            child.localizeInfos?.title ||
                            ''}
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
            </li>
          );
        })}
      </NavUnderline>
    </nav>
  );
};

export default NavigationMenu;
