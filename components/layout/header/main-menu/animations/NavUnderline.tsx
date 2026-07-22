'use client';

import { usePathname } from 'next/navigation';
import type { JSX, ReactNode } from 'react';

import UnderlineFlow from '@/app/animations/UnderlineFlow';

/**
 * NavUnderline — the desktop main menu list carried by {@link UnderlineFlow}:
 * one underline flows between the items on hover and settles on the item of the
 * page currently open.
 *
 * All this adds to the shared wrapper is the route lookup, which is why it lives
 * on the client: `hrefs` must be in the same order as `children`, and the entry
 * matching the current pathname is where the bar rests. A route outside the menu
 * simply leaves no active item and the bar stays hidden until something is hovered.
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
