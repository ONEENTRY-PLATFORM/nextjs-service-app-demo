'use client';

import clsx from 'clsx';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type JSX, useMemo } from 'react';

const DropdownIcon = dynamic(() => import('./DropdownIcon'), {
  ssr: false,
});

/**
 * Main navigation menu item component.
 *
 * This component represents a single item in the main navigation menu.
 * It handles both regular menu items and items with dropdown menus.
 * The component uses Next.js Link for client-side navigation and includes
 * active state styling when the current pathname matches the item's href.
 *
 * For items with dropdowns, it dynamically imports and displays a dropdown icon.
 * The active state is determined by comparing the current pathname with the item's href.
 * @param   {object}      props             - The properties for the navigation menu item
 * @param   {string}      props.label       - The label for the menu item
 * @param   {string}      props.href        - The URL for the menu item
 * @param   {boolean}     props.hasDropdown - Boolean indicating if the item has a dropdown
 * @returns {JSX.Element}                   JSX.Element representing the main navigation menu item
 */
const NavigationMenuItem = ({
  label,
  href,
  hasDropdown = false,
}: {
  label: string;
  href: string;
  hasDropdown?: boolean;
}): JSX.Element => {
  /** Get current pathname for active link detection */
  const pathname = usePathname();
  /** Determine if current link is active based on pathname comparison */
  const isActive = useMemo(() => pathname === href, [pathname, href]);

  /** Render navigation menu item with active state styling */
  return (
    <Link
      prefetch={true}
      href={href === 'home' ? '/' : href}
      className={clsx(
        'flex items-center justify-center gap-2 border-b-2 pb-0.5 text-base font-medium transition-colors duration-300 ease-in-out hover:text-fuchsia-500 focus:text-fuchsia-500 focus:outline-none',
        isActive
          ? 'border-fuchsia-500 text-fuchsia-500'
          : 'border-transparent opacity-60',
      )}
    >
      <div
        className={clsx(
          isActive &&
            'fill-fuchsia-500 text-fuchsia-500 transition-colors duration-300',
        )}
      >
        {label}
      </div>
      {hasDropdown && <DropdownIcon isActive={isActive} />}
    </Link>
  );
};

export default NavigationMenuItem;
