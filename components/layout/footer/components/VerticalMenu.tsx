import type { IMenusPages } from 'oneentry/dist/menus/menusInterfaces';
import type { JSX } from 'react';

import { getMenuByMarker } from '@/app/api';

import MenuItem from './VerticalMenuItem';

/**
 * VerticalMenu component to render a vertical navigation menu in the footer.
 *
 * This component fetches menu data by marker and displays it as a vertical list
 * of menu items. It handles error cases and empty menus gracefully.
 * @param   {object}               props           - Component properties
 * @param   {string}               props.className - CSS classes to apply to the menu container
 * @param   {string}               props.menuName  - Name/identifier of the menu to fetch
 * @param   {string}               props.baseUrl   - Base URL to prepend to menu item links
 * @returns {Promise<JSX.Element>}                 JSX.Element representing the vertical menu or undefined if no menu data
 */
const VerticalMenu = async ({
  className,
  menuName,
  baseUrl,
}: {
  className: string;
  menuName: string;
  baseUrl: string;
}): Promise<JSX.Element> => {
  /** Fetch menu data by marker for navigation */
  const { isError, menu } = await getMenuByMarker(menuName);
  /** Extract pages from menu data */
  const pages = menu?.pages as Array<IMenusPages>;

  /** Return empty element if menu data is invalid or empty */
  if (
    isError ||
    !menu ||
    !pages ||
    (Array.isArray(pages) && pages.length < 1)
  ) {
    return <></>;
  }

  /** Render vertical menu with title and navigation items */
  return (
    <nav className={className}>
      {/** Display menu title */}
      <h3 className="text-lg font-bold">{menu.localizeInfos?.title}</h3>
      {/** Render menu items list */}
      <ul className="relative box-border flex shrink-0 flex-col gap-2.5 leading-4">
        {pages.map((page, index) => {
          return <MenuItem key={index} page={page} baseUrl={baseUrl} />;
        })}
      </ul>
    </nav>
  );
};

export default VerticalMenu;
