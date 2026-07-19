'use client';

import type { JSX, ReactNode } from 'react';

import { useHeroRef } from './HeroAnimations';

/**
 * HeroDescription — leaf wrapper for the hero subtitle line under the title.
 * @param   {object}      props             - Component properties
 * @param   {ReactNode}   props.children    - Subtitle text
 * @param   {string}      [props.className] - CSS classes for the paragraph
 * @returns {JSX.Element}                   Subtitle paragraph carrying the `description` ref
 */
const HeroDescription = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}): JSX.Element => {
  const ref = useHeroRef('description');
  return (
    <p ref={ref} className={className}>
      {children}
    </p>
  );
};

export default HeroDescription;
