import type { JSX } from 'react';

import TitleAnimations from '@/app/animations/TitleAnimations';

/**
 * Home section title — mirrors the static-html `SectionTitle` (HomePage.tsx):
 * light Lato, uppercase, wide letter-spacing, responsive `clamp` size, with a
 * thin underline that spans the text plus its horizontal padding (so the rule
 * is a touch wider than the text), coloured DARK (`slate-400` = `#4c4d56`).
 *
 * The GSAP `TitleAnimations` wrapper and the `.title` / `<hr>` hooks are kept so
 * the entrance/underline-draw animation still runs; the `<hr>` replaces the
 * mock's plain `<div>` underline for that reason.
 * @param   {object}      props             - Component properties
 * @param   {string}      props.title       - Heading text (rendered uppercase)
 * @param   {number}      [props.delay]     - GSAP entrance delay (seconds)
 * @param   {string}      [props.className] - Extra classes for the wrapper (e.g. bottom margin)
 * @returns {JSX.Element}                   Animated section title
 */
const SectionTitle = ({
  title,
  delay = 0,
  className = '',
}: {
  title: string;
  delay?: number;
  className?: string;
}): JSX.Element => (
  <TitleAnimations
    delay={delay}
    className={`mx-auto flex w-fit flex-col gap-2 py-3 md:py-5 ${className}`}
  >
    <h2 className="title px-3 text-center text-[clamp(1.4rem,2.5vw,2.25rem)] font-light tracking-widest whitespace-nowrap text-ink uppercase">
      {title}
    </h2>
    <hr className="relative h-px w-full self-center border-b border-solid border-b-slate-400" />
  </TitleAnimations>
);

export default SectionTitle;
