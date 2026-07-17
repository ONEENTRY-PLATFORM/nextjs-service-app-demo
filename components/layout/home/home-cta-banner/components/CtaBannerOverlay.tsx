import Link from 'next/link';
import type { JSX } from 'react';

/**
 * Promo headline and booking button drawn over the CTA banner artwork, following
 * the hero overlay: the artwork is a clean photo, the headline comes from the
 * CMS block, and an empty one leaves the art decorative.
 *
 * Copy is the headline only — the static-html discount banner carries no
 * supporting line or phone, so neither is rendered here even when the CMS block
 * holds them. Layout mirrors that design: the headline is centered on the banner
 * and the button sits apart from it — bottom-center with the button beneath it
 * on mobile, centered on the wide banner with the button pinned to the right on
 * desktop. Headline and button are separate blocks (not one column) precisely so
 * the button can detach to the right on desktop while the headline stays centered.
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
  <div className="absolute inset-0 flex flex-col items-center justify-end gap-3 px-6 pb-[12%] text-center md:block md:p-0">
    {/* Headline: bottom-center on mobile, centered on desktop. The wider right
        pad keeps a long headline clear of the right-pinned button and nudges the
        centering slightly left, matching the artwork whose subject sits left. */}
    <div className="flex flex-col items-center md:absolute md:inset-0 md:justify-center md:pr-[20%] md:pl-[8%]">
      {title && (
        <h2
          className="text-3xl leading-none text-white md:text-5xl lg:text-6xl"
          style={{ fontFamily: 'var(--font-league-gothic)' }}
        >
          {title}
        </h2>
      )}
    </div>
    {/* Button: beneath the headline on mobile, pinned right-of-center on desktop */}
    {buttonText && (
      <Link
        href="/booking"
        className="relative mt-3 shrink-0 rounded-xl px-8 py-3.5 text-base font-black tracking-wider text-white uppercase transition-transform duration-200 hover:scale-105 active:scale-95 md:absolute md:top-1/2 md:right-[6%] md:mt-0 md:-translate-y-1/2"
        style={{
          background: 'rgba(255,255,255,0.22)',
          border: '2px solid rgba(255,255,255,0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {buttonText}
      </Link>
    )}
  </div>
);

export default CtaBannerOverlay;
