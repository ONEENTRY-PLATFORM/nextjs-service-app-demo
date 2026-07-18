'use client';

import type { JSX, ReactNode } from 'react';

import { useHeroRef } from './HeroAnimations';

/**
 * HeroBg — leaf wrapper that registers the hero background element with the
 * enclosing {@link HeroAnimations} (via {@link useHeroRef}) so the parallax and
 * enter/leave timelines drive it by reference. Wrap the hero's `<Image>` (which
 * positions with `fill` against this box); keep the veil/overlay as a sibling
 * outside so it is not scaled/faded with the photo.
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
