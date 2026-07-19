import Link from 'next/link';
import type { JSX } from 'react';

/**
 * Promo headline and booking button drawn over the CTA banner artwork, following
 * the hero overlay: the artwork is a clean photo, the headline comes from the
 * CMS block, and an empty one leaves the art decorative.
 *
 * Copy is the headline only — the static-html discount banner carries no
 * supporting line or phone, so neither is rendered here even when the CMS block
 * holds them. Layout mirrors the Figma banner: the headline is left-aligned in
 * both viewports. On the wide desktop banner it sits in the right half (over the
 * gradient), vertically centered, with the button pinned to the far right; on
 * mobile the headline and the button stack in a bottom-left column so the button
 * sits below the headline. Headline and button are absolutely positioned on
 * desktop precisely so the button can detach to the right while the headline
 * stays put.
 * @param   {object}      props            - Component properties
 * @param   {string}      props.title      - Banner headline (`title`)
 * @param   {string}      props.buttonText - Booking button label (`button_text`)
 * @returns {JSX.Element}                  Overlay with the CMS headline and CTA
 */
const CtaBannerOverlay = ({
  title,
  buttonText,
}: {
  title: string;
  buttonText: string;
}): JSX.Element => (
  <div className="absolute inset-0 flex flex-col items-start justify-end gap-10 px-[13%] pb-[11%] text-left md:block md:p-0">
    {/* Headline: bottom-left on mobile, vertically centered in the right half on
        desktop (left-42% clears the photo). Left-aligned in both, matching the
        artwork. The em-based max-width tracks the font at every breakpoint so the
        headline keeps its two-line break (dash starting the second line) at the
        mobile, md and lg font sizes alike. */}
    {title && (
      <h2
        className="leading-0.95 max-w-[4.8em] text-4xl text-white md:absolute md:top-1/2 md:left-[42%] md:-translate-y-1/2 md:text-5xl lg:text-6xl"
        style={{ fontFamily: 'var(--font-league-gothic)' }}
      >
        {title}
      </h2>
    )}
    {/* Button: beneath the headline on mobile, pinned right-of-center on desktop.
        Glassmorphic style straight from the mock's "Book Now" (bg white/22,
        2px white/50 border, blur 8px, font-black). */}
    {buttonText && (
      <Link
        href="/booking"
        className="inline-flex items-center justify-center rounded-xl border-2 border-white/50 bg-white/22 px-8 py-3.5 text-base font-black tracking-wider text-white uppercase backdrop-blur-sm transition-transform hover:scale-105 active:scale-96 md:absolute md:top-1/2 md:right-[4%] md:-translate-y-1/2"
      >
        {buttonText}
      </Link>
    )}
  </div>
);

export default CtaBannerOverlay;
