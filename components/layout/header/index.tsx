import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IMenusEntity } from 'oneentry/dist/menus/menusInterfaces';
import type { ReactElement } from 'react';
import { Suspense } from 'react';

import { ServerProvider } from '@/app/store/providers/ServerProvider';
import SearchIcon from '@/components/icons/search';
import NavigationMenu from '@/components/layout/header/main-menu';

import Logo from './Logo';
import NavGroup from './nav/NavGroup';
import SearchBar from './search/SearchBar';

/**
 * Header component to render the main site header with logo, search bar, and navigation.
 *
 * This component renders the complete site header including the logo, search functionality,
 * main navigation menu, and additional navigation elements. It uses a server provider to
 * retrieve dictionary data for localization and implements a fallback UI for the search bar.
 *
 * The header is organized into several sections:
 * 1. Logo on the left side
 * 2. Search bar in the center
 * 3. Main navigation menu on the right
 * 4. Additional navigation elements (user profile, cart, etc.)
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

  /**
   * Fallback JSX for search bar during Suspense loading. Declared inline as
   * an element (not a component) so React does not re-create a component
   * type on every render and reset Suspense boundary state.
   */
  const fallback = (
    <div className="relative text-neutral-600 max-2xl:hidden">
      <div className="flex w-full">
        <button
          type="submit"
          className="group relative m-auto box-border flex shrink-0 flex-col p-2.5"
        >
          <span className="sr-only">{search_placeholder?.value as string}</span>
          <SearchIcon />
        </button>
        <div
          id="searchInput"
          className="my-auto h-6.25 w-52.5 rounded-xl border border-solid border-gray-200 px-2.5 text-neutral-400 transition-colors duration-300 ease-in-out outline-none focus:border-none focus:ring-1 focus:ring-fuchsia-500 focus:outline-none"
        />
      </div>
    </div>
  );

  return (
    <div id="header">
      <header className="flex flex-col items-center bg-white/60 px-5 py-6 text-center backdrop-blur-md max-lg:py-5 max-md:px-5 max-md:py-3 max-sm:py-1">
        <section className="flex w-full max-w-350 flex-row items-center justify-between gap-5 max-md:flex max-md:max-w-full max-md:flex-row max-md:flex-wrap">
          <div className={'relative box-border flex w-1/5 shrink-0 flex-col'}>
            <Logo />
          </div>
          <div className="fade-in">
            <Suspense fallback={fallback}>
              <SearchBar
                placeholder={
                  (search_placeholder?.value as string | undefined) || 'Search'
                }
              />
            </Suspense>
          </div>
          <NavigationMenu menu={menu} />
          <NavGroup />
        </section>
      </header>
    </div>
  );
};

export default Header;
