import type { IAttributeValues, IMenusEntity } from 'oneentry/types';
import type { ReactElement } from 'react';

import { ServerProvider } from '@/app/store/providers/ServerProvider';
import NavigationMenu from '@/components/layout/header/main-menu';
import { flatMenuToNested } from '@/components/utils/flatMenuToNested';
import { normalizeMenuPages } from '@/components/utils/normalizeMenuPages';

import Logo from './Logo';
import BookOnlineLink from './nav/BookOnlineLink';
import MobileNavPanel from './nav/MobileNavPanel';
import NavGroup from './nav/NavGroup';
import SearchModal from './search/SearchModal';

/**
 * Header component to render the main site header with logo, search and navigation.
 * logo on the left, the main navigation
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

  /** Main menu links for the inline mobile panel (same hrefs as desktop nav) */
  const panelItems = (
    menu?.pages ? flatMenuToNested(normalizeMenuPages(menu.pages), null) : []
  ).map((item) => ({
    label: item.localizeInfos?.menuTitle || item.localizeInfos?.title || '',
    href: `/${item.pageUrl && item.pageUrl !== 'home' ? item.pageUrl : ''}`,
  }));

  return (
    <div id="header">
      <header className="flex flex-col items-center bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
        <section className="flex h-20 w-full max-w-7xl flex-row items-center justify-between gap-5 px-3 md:px-8">
          <div className={'relative box-border flex shrink-0 flex-col'}>
            <Logo />
          </div>
          <NavigationMenu menu={menu} />
          <BookOnlineLink variant="mobile" />
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
        <MobileNavPanel items={panelItems} />
      </header>
    </div>
  );
};

export default Header;
