'use client';

import { usePathname } from 'next/navigation';
import type { JSX, ReactNode } from 'react';

import UnderlineFlow from '@/app/animations/UnderlineFlow';

/**
 * NavUnderline — the desktop main menu list with the flowing underline of
 * {@link UnderlineFlow}, resting on the item of the current page.
 *
 * All the bar does is follow the pointer and fall back to the active item, so
 * the only thing this wrapper adds is the route lookup: `hrefs` must be in the
 * same order as `children`, it is what tells the bar which item is the current
 * page. A route that is not in the menu leaves the bar hidden.
 * @param   {object}      props             - Component properties
 * @param   {ReactNode}   props.children    - Menu items, one `li` per href
 * @param   {string[]}    props.hrefs       - Item hrefs in render order, used to find the active one
 * @param   {string}      [props.className] - CSS classes for the list element
 * @returns {JSX.Element}                   Menu list with the animated underline
 */
const NavUnderline = ({
  children,
  hrefs,
  className,
}: {
  children: ReactNode;
  hrefs: string[];
  className?: string | undefined;
}): JSX.Element => {
  const pathname = usePathname();
  const activeIndex = hrefs.indexOf(pathname);

  return (
    <UnderlineFlow
      element="ul"
      active={activeIndex < 0 ? null : activeIndex}
      className={className}
    >
      {children}
    </UnderlineFlow>
  );
};

export default NavUnderline;
