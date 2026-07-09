import type { IMenusPages } from 'oneentry/dist/menus/menusInterfaces';
import type { JSX } from 'react';

import MobileMenuItem from './MobileMenuItem';

/**
 * MobileMenu component renders a list of menu items for mobile view
 * @param   {object}        props           - Mobile menu list props
 * @param   {IMenusPages[]} props.menu      - Array of menu page objects to display
 * @param   {string}        props.className - Optional CSS class name to apply to the container
 * @param   {string}        props.parentUrl - Optional parent URL to construct full paths
 * @returns {JSX.Element}                   Mobile menu list or empty fragment if menu has no items
 */
function MobileMenu({
  menu,
  className = '',
  parentUrl = '',
}: {
  menu: IMenusPages[];
  className?: string;
  parentUrl?: string;
}): JSX.Element {
  /** Don't render if menu has no items */
  if (menu.length < 1) return <></>;

  /** Render mobile menu with list of menu items */
  return (
    <ul className={`flex flex-col ${className}`}>
      {menu.map((item: IMenusPages) => (
        <MobileMenuItem key={item.id} item={item} parentUrl={parentUrl} />
      ))}
    </ul>
  );
}

export default MobileMenu;
