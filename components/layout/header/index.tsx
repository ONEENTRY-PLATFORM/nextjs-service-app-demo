import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IMenusEntity } from 'oneentry/dist/menus/menusInterfaces';
import type { ReactElement } from 'react';

import { ServerProvider } from '@/app/store/providers/ServerProvider';
import NavigationMenu from '@/components/layout/header/main-menu';

import Logo from './Logo';
import NavGroup from './nav/NavGroup';
import SearchModal from './search/SearchModal';

/**
 * Header component to render the main site header with logo, search and navigation.
 *
 * Layout follows the static-html mock: logo on the left, the main navigation
 * in the middle and the actions group (search icon with popup, Book Online
 * button, profile) on the right.
 * @param   {object}                props      - Component properties
 * @param   {IMenusEntity}          props.menu - Menu data for the navigation menu from OneEntry CMS
 * @returns {Promise<ReactElement>}            JSX.Element representing the site header
 */
const Header = async ({
  menu,
}: {
  menu: IMenusEntity;
}): Promise<ReactElement> => {
  /** Retrieve props from server provider */
  const [dict] = ServerProvider<IAttributeValues>('dict');
  const { search_placeholder } = dict;

  return (
    <div id="header">
      <header className="flex flex-col items-center bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
        <section className="flex h-20 w-full max-w-7xl flex-row items-center justify-between gap-5 px-3 md:px-8">
          <div className={'relative box-border flex shrink-0 flex-col'}>
            <Logo />
          </div>
          <NavigationMenu menu={menu} />
          <div className="flex items-center gap-3">
            <div className="fade-in">
              <SearchModal
                placeholder={
                  (search_placeholder?.value as string | undefined) ||
                  'Search services or specialists…'
                }
              />
            </div>
            <NavGroup />
          </div>
        </section>
      </header>
    </div>
  );
};

export default Header;
