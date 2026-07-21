'use client';

import type { JSX, ReactNode } from 'react';

import { useHeroRef } from './hero/useHeroRef';

/**
 * HeroKicker — leaf wrapper for the small eyebrow line above the hero title
 * @param   {object}      props             - Component properties
 * @param   {ReactNode}   props.children    - Kicker text
 * @param   {string}      [props.className] - CSS classes for the paragraph
 * @returns {JSX.Element}                   Kicker paragraph carrying the `kicker` ref
 */
const HeroKicker = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}): JSX.Element => {
  const ref = useHeroRef('kicker');
  return (
    <p ref={ref} className={className}>
      {children}
    </p>
  );
};

export default HeroKicker;
