'use client';

import Link from 'next/link';
import type { IMenusPages } from 'oneentry/types';
import type { JSX } from 'react';

/**
 * User menu item link component.
 * @param   {object}                   props          - Props for the component.
 * @param   {IMenusPages}              props.page     - The page object containing URL and localization info.
 * @param   {(state: boolean) => void} props.setState - Function to update state.
 * @returns {JSX.Element}                             JSX.Element representing a user menu item link.
 */
const UserMenuItem = ({
  page,
  setState,
}: {
  page: IMenusPages;
  setState: (state: boolean) => void;
}): JSX.Element => (
  <Link
    prefetch={false}
    href={`/${page.pageUrl}`}
    title={page.localizeInfos.menuTitle ?? undefined}
    className="group relative box-border flex p-2 text-slate-800 hover:text-fuchsia-500"
    onClick={() => setState(false)}
  >
    {page.localizeInfos.menuTitle}
  </Link>
);

export default UserMenuItem;
