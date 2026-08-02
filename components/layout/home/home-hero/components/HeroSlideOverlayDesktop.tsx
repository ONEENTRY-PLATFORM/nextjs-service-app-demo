import type { JSX } from 'react';

import HeroDescription from '@/app/animations/HeroDescription';
import HeroKicker from '@/app/animations/HeroKicker';
import HeroTitle from '@/app/animations/HeroTitle';

import SaleText from './SaleText';

/**
 * HeroSlideOverlayDesktop — the desktop (`lg:`) text overlay of a hero slide.
 *
 * The sale badge, the heading and the subtitle register as the hero
 * `kicker`/`title`/`description` through the {@link HeroKicker}/{@link HeroTitle}/
 * {@link HeroDescription} wrappers, so they drop in and drift on scroll exactly
 * like the headings of the inner pages. Their transforms grow from the left edge
 * (`origin-left`) because this overlay is anchored to the bottom-left corner and
 * a centred scale would push the text out of the banner.
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
      <HeroKicker className="flex size-[13.18em] shrink-0 origin-left items-center justify-center rounded-full bg-logo-dot/60">
        <span
          className="px-2 text-center text-[8.49em] text-nowrap text-white/80 [text-box:trim-both_cap_alphabetic]"
          style={{ fontFamily: 'var(--font-league-gothic)', lineHeight: 0.915 }}
        >
          <SaleText text={sale} />
        </span>
      </HeroKicker>
    )}

    <div className="flex flex-col gap-[1.98em]">
      {title && (
        <HeroTitle
          className="origin-left text-[6.53em] leading-none text-white/80 [text-box:trim-both_cap_alphabetic]"
          style={{
            fontFamily: 'var(--font-league-gothic)',
            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          {title}
        </HeroTitle>
      )}
      {text && (
        <HeroDescription className="origin-left text-[1.93em] leading-none font-light text-white capitalize [text-box:trim-both_cap_alphabetic]">
          {text}
        </HeroDescription>
      )}
    </div>
  </div>
);

export default HeroSlideOverlayDesktop;
