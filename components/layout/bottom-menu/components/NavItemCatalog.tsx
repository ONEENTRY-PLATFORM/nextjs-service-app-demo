'use client';

import Link from 'next/link';
import type { IMenusPages } from 'oneentry/types';
import type { JSX } from 'react';

import CatalogIcon from '@/components/icons/catalog';

/**
 * Catalog navigation menu item.
 * @param   {object}      props      - component props.
 * @param   {IMenusPages} props.item - menu element object.
 * @returns {JSX.Element}            JSX.Element.
 */
const NavItemCatalog = ({
  item: { pageUrl, localizeInfos },
}: {
  item: IMenusPages;
}): JSX.Element => {
  /** Render catalog navigation item with link and icon */
  return (
    <Link
      prefetch={false}
      href={'/' + pageUrl}
      title={localizeInfos.menuTitle ?? undefined}
      className="group relative box-border flex size-6 shrink-0 flex-col"
    >
      <CatalogIcon />
    </Link>
  );
};

export default NavItemCatalog;
