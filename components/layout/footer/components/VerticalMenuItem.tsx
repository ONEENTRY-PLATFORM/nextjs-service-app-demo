'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { IMenusPages } from 'oneentry/dist/menus/menusInterfaces';
import type { JSX } from 'react';

/**
 * Footer menu item.
 * @param   {object}      props         - Component props.
 * @param   {IMenusPages} props.page    - Represents a page object.
 * @param   {string}      props.baseUrl - Base URL for the page.
 * @returns {JSX.Element}               menu item.
 */
const MenuItem = ({
  page,
  baseUrl,
}: {
  page: IMenusPages;
  baseUrl: string;
}): JSX.Element => {
  /** Get current pathname for active link detection */
  const paths = usePathname();

  /** Return empty element if page data is missing */
  if (!page) {
    return <></>;
  }
  /** Determine if current link is active based on pathname */
  const isActive = paths === '/' + page.pageUrl;

  /** Render menu item with link and active state styling */
  return (
    <li className="relative box-border border-b border-black/80">
      <Link
        prefetch={false}
        className={
          'flex py-3 text-base transition-opacity hover:opacity-70 focus:outline-none ' +
          (isActive ? 'font-bold' : '')
        }
        href={baseUrl ? '/' + baseUrl + '/' + page.pageUrl : '/' + page.pageUrl}
      >
        {page.localizeInfos?.menuTitle}
      </Link>
    </li>
  );
};

export default MenuItem;
