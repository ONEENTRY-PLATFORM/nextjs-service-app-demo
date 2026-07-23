import Link from 'next/link';
import type { JSX } from 'react';

/**
 * Promo headline and booking button drawn over the CTA banner artwork, following
 * the hero overlay: the artwork is a clean photo, the headline comes from the
 * CMS block, and an empty one leaves the art decorative.
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
  <div className="absolute inset-0 flex flex-col items-start justify-end gap-10 px-[8%] pb-[12%] text-left md:top-1/2 md:right-[4%] md:bottom-auto md:left-[42%] md:-translate-y-1/2 md:flex-row md:items-end md:justify-between md:p-0">
    {title && (
      <h2
        className="max-w-[4.8em] text-[4rem] leading-none text-balance text-white max-sm:mx-auto md:text-[5.75rem]"
        style={{ fontFamily: 'var(--font-league-gothic)' }}
      >
        {title}
      </h2>
    )}
    {buttonText && (
      <Link
        href="/booking"
        className="inline-flex w-[70%] items-center justify-center self-center rounded-xl border-2 border-white/50 bg-white/22 px-8 py-3.5 text-base font-black tracking-wider text-white uppercase backdrop-blur-sm transition-transform hover:scale-105 active:scale-96 md:ml-auto md:w-auto md:shrink-0 md:self-auto"
      >
        {buttonText}
      </Link>
    )}
  </div>
);

export default CtaBannerOverlay;
