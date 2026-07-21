'use client';

import type { JSX, ReactNode } from 'react';

import { useHeroRef } from './hero/useHeroRef';

/**
 * HeroBg — leaf wrapper that registers the hero background element
 * @param   {object}      props             - Component properties
 * @param   {ReactNode}   props.children    - The background image element
 * @param   {string}      [props.className] - CSS classes for the wrapper box
 * @returns {JSX.Element}                   Background wrapper carrying the `bg` ref
 */
const HeroBg = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}): JSX.Element => {
  const ref = useHeroRef('bg');
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default HeroBg;
