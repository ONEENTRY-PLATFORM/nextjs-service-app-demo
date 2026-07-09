'use client';

// import { useGSAP } from '@gsap/react';
// import { gsap } from 'gsap';
import type { JSX, ReactNode } from 'react';
import { useRef } from 'react';

/**
 * MenuAnimations component for wrapping menu items and providing animation capabilities
 * @param   {object}      props           - Component properties
 * @param   {ReactNode}   props.children  - Child elements, typically menu items
 * @param   {string}      props.className - CSS class name applied to the ul element
 * @returns {JSX.Element}                 A ul element containing child elements
 */
const MenuAnimations = ({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}): JSX.Element => {
  const ref = useRef<HTMLUListElement>(null);

  return (
    <ul ref={ref} className={className}>
      {children}
    </ul>
  );
};

export default MenuAnimations;
