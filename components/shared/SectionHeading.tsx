import type { JSX, ReactNode } from 'react';

import TitleAnimations from '@/app/animations/TitleAnimations';

/**
 * SectionHeading component — the single section heading used across the whole
 * site (home, contacts, portfolio …): light Lato uppercase with wide
 * letter-spacing (`tracking-widest`) and a thin underline rule, at one shared
 * responsive size (`clamp(1.4rem,2.5vw,2.25rem)`) so every section title looks
 * identical no matter the page.
 *
 * Wrapped in {@link TitleAnimations} so it plays one shared entrance everywhere:
 * the text fades in (`.title` hook) while the underline (`<hr>` hook) draws from
 * zero to full width. Keep the `.title` class on the heading and the `<hr>`
 * element — they are the GSAP hooks the wrapper queries.
 * @param   {object}      props             - Component properties
 * @param   {ReactNode}   props.children    - Heading text
 * @param   {string}      [props.align]     - Horizontal alignment, `center` (default) or `left`
 * @param   {boolean}     [props.underline] - Whether to render the underline rule (default `true`)
 * @param   {number}      [props.delay]     - GSAP entrance delay in seconds
 * @param   {string}      [props.className] - Extra CSS classes for the wrapper
 * @returns {JSX.Element}                   Section heading element
 */
const SectionHeading = ({
  children,
  align = 'center',
  underline = true,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  align?: 'center' | 'left' | undefined;
  underline?: boolean | undefined;
  delay?: number | undefined;
  className?: string | undefined;
}): JSX.Element => (
  <TitleAnimations
    delay={delay}
    className={`flex w-fit flex-col gap-2 py-3 ${align === 'center' ? 'mx-auto items-center' : 'items-start'} ${className}`}
  >
    <h2 className="title px-3 text-center text-[clamp(1.4rem,2.5vw,2.25rem)] font-light tracking-widest whitespace-nowrap text-ink uppercase">
      {children}
    </h2>
    {underline && (
      <hr className="relative h-px w-full self-center border-b border-solid border-b-slate-400" />
    )}
  </TitleAnimations>
);

export default SectionHeading;
