'use client';

import type { JSX, ReactNode } from 'react';

import { useHeroRef } from './HeroAnimations';

/**
 * HeroKicker — leaf wrapper for the small eyebrow line above the hero title
 * (e.g. "Beauty Studio"). Registers itself with the enclosing
 * {@link HeroAnimations} via {@link useHeroRef} so it reveals and parallaxes in
 * sync with the rest of the hero text, by reference rather than by CSS class.
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
