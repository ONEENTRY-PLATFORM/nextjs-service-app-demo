'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { JSX } from 'react';
import { useContext } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import { useDict } from '@/app/store/providers/useDict';

/**
 * MobileNavPanel — inline expanding navigation panel under the header row.
 *
 * on <lg the hamburger toggles a panel that
 * slides open right below the header (height animation, top border #e8e8f0)
 * and lists the main menu links as plain rows — pink for the active page,
 * DARK otherwise. Replaces the previous offcanvas drawer to match the mock.
 * @param   {object}                            props       - Component properties
 * @param   {{ label: string; href: string }[]} props.items - Main menu links (label + resolved href)
 * @returns {JSX.Element}                                   JSX.Element representing the mobile navigation panel
 */
const MobileNavPanel = ({
  items,
}: {
  items: { label: string; href: string }[];
}): JSX.Element => {
  /** Current pathname for active link detection */
  const pathname = usePathname();
  /** Panel open state shared with the hamburger trigger */
  const { open, component, setOpen } = useContext(OpenDrawerContext);
  /** UI-text dictionary for the localized aria-label */
  const dict = useDict();
  const isOpen = open && component === 'MobileMenu';

  return (
    <div
      className={clsx(
        'grid w-full overflow-hidden border-slate-150 transition-[grid-template-rows] duration-300 lg:hidden',
        isOpen ? 'grid-rows-[1fr] border-t' : 'grid-rows-[0fr]',
      )}
    >
      <nav
        aria-label={
          (dict?.mobile_menu_aria?.value as string | undefined) || 'Mobile menu'
        }
        data-testid="mobile-nav-panel"
        className="min-h-0 overflow-hidden"
      >
        <div className="space-y-3 px-6 py-4">
          {items.map((item) => (
            <Link
              key={item.href}
              prefetch={false}
              href={item.href}
              onClick={() => setOpen(false)}
              data-testid="mobile-nav-link"
              className={clsx(
                'block py-1.5 text-base font-medium',
                pathname === item.href ? 'text-fuchsia-500' : 'text-slate-400',
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MobileNavPanel;
