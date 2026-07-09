import type { IMenusEntity } from 'oneentry/dist/menus/menusInterfaces';
import type { JSX } from 'react';

import { flatMenuToNested } from '@/components/utils';

import MainMenuLoader from './components/MenuLoader';
import NavigationMenu from './components/NavigationMenu';

/**
 * Main menu component for rendering the site's primary navigation.
 *
 * This component serves as the main navigation menu container that processes
 * menu data from the OneEntry CMS. It converts the flat menu structure to
 * a nested structure for proper rendering and handles loading states when
 * menu data is not available.
 *
 * The component uses the flatMenuToNested utility function to transform
 * the menu data into a hierarchical structure that can be rendered by
 * the NavigationMenu component.
 * @param   {object}               props      - Component properties
 * @param   {IMenusEntity}         props.menu - Menu data from OneEntry CMS containing pages information
 * @returns {Promise<JSX.Element>}            JSX.Element representing the main navigation menu or a loading state
 */
const MainMenu = async ({
  menu,
}: {
  menu: IMenusEntity;
}): Promise<JSX.Element> => {
  if (!menu?.pages) {
    return <MainMenuLoader limit={4} />;
  }

  /** Convert menu flat array to nested structure */
  const mainMenu = flatMenuToNested(
    Array.isArray(menu.pages) ? menu.pages : [],
    null,
  );

  return <NavigationMenu menu={mainMenu} />;
};

export default MainMenu;
