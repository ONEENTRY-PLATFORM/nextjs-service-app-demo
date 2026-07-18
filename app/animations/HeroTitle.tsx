'use client';

import type { CSSProperties, JSX, ReactNode } from 'react';

import { useHeroRef } from './HeroAnimations';

/**
 * HeroTitle — leaf wrapper for the hero heading. Registers itself with the
 * enclosing {@link HeroAnimations} via {@link useHeroRef} so the enter/leave and
 * parallax timelines drive it by reference. `testId` and extra `className` are
 * passed through so callers can keep their existing test hooks (e.g. the
 * contacts hero title) and page-level animation classes (e.g. booking's
 * `title`).
 * @param   {object}        props             - Component properties
 * @param   {ReactNode}     props.children    - Title text
 * @param   {string}        [props.className] - CSS classes for the heading
 * @param   {CSSProperties} [props.style]     - Inline styles for the heading
 * @param   {string}        [props.testId]    - Optional `data-testid`
 * @returns {JSX.Element}                     Heading carrying the `title` ref
 */
const HeroTitle = ({
  children,
  className,
  style,
  testId,
}: {
  children: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  testId?: string | undefined;
}): JSX.Element => {
  const ref = useHeroRef('title');
  return (
    <h1 ref={ref} className={className} style={style} data-testid={testId}>
      {children}
    </h1>
  );
};

export default HeroTitle;
