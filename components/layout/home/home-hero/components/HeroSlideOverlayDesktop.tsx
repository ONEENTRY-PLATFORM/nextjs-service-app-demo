import type { JSX } from 'react';

import SaleText from './SaleText';

/**
 * HeroSlideOverlayDesktop — the desktop (`lg:`) text overlay of a hero slide
 * @param   {object}      props       - Component properties
 * @param   {string}      props.sale  - Badge text (e.g. "-15%"), empty to hide
 * @param   {string}      props.title - Slide title, empty to hide
 * @param   {string}      props.text  - Slide subtitle, empty to hide
 * @returns {JSX.Element}             JSX.Element with the desktop slide overlay
 */
const HeroSlideOverlayDesktop = ({
  sale,
  title,
  text,
}: {
  sale: string;
  title: string;
  text: string;
}): JSX.Element => (
  <div
    className="pointer-events-none absolute inset-0 z-10 hidden flex-col items-start justify-end gap-[1.77em] pb-[3.13em] pl-[5.21em] lg:flex"
    style={{ fontSize: 'var(--hero-u)' }}
  >
    {/* Flat translucent pink disc — the Figma has no border or blur here */}
    {sale && (
      <div className="flex size-[13.18em] shrink-0 items-center justify-center rounded-full bg-logo-dot/60">
        <span
          className="px-2 text-center text-[8.49em] text-nowrap text-white/80 [text-box:trim-both_cap_alphabetic]"
          style={{ fontFamily: 'var(--font-league-gothic)', lineHeight: 0.915 }}
        >
          <SaleText text={sale} />
        </span>
      </div>
    )}

    <div className="flex flex-col gap-[1.98em]">
      {title && (
        <h1
          className="text-[6.53em] leading-none text-white/80 [text-box:trim-both_cap_alphabetic]"
          style={{
            fontFamily: 'var(--font-league-gothic)',
            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          {title}
        </h1>
      )}
      {text && (
        <p className="text-[1.93em] leading-none font-light text-white capitalize [text-box:trim-both_cap_alphabetic]">
          {text}
        </p>
      )}
    </div>
  </div>
);

export default HeroSlideOverlayDesktop;
