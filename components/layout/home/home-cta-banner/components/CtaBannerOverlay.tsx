import Link from 'next/link';
import type { JSX } from 'react';

import { formatUaePhone } from '@/components/utils';

/**
 * Promo copy and booking button drawn over the CTA banner artwork, following
 * the hero overlay: the artwork is a clean photo, every line comes from the CMS
 * block, and an empty field renders nothing at all. The column sits at the
 * bottom on mobile and on the right-hand side of the wide banner on desktop.
 * @param   {object}      props             - Component properties
 * @param   {string}      props.title       - Banner headline (`title`)
 * @param   {string}      props.description - Supporting line (`description`)
 * @param   {string}      props.phone       - Contact phone (`phone`), rendered as a call link
 * @param   {string}      props.buttonText  - Booking button label (`button_text`)
 * @returns {JSX.Element}                   Overlay with the CMS copy
 */
const CtaBannerOverlay = ({
  title,
  description,
  phone,
  buttonText,
}: {
  title: string;
  description: string;
  phone: string;
  buttonText: string;
}): JSX.Element => (
  <div className="absolute inset-0 flex flex-col items-center justify-end gap-3 px-6 pb-[10%] text-center md:items-end md:justify-center md:px-[5%] md:pb-0 md:text-right">
    {title && (
      <h2
        className="text-3xl leading-none text-white md:text-5xl lg:text-6xl"
        style={{ fontFamily: 'var(--font-league-gothic)' }}
      >
        {title}
      </h2>
    )}
    {description && (
      <p className="text-base font-light tracking-wide text-white/85 md:text-xl">
        {description}
      </p>
    )}
    {phone && (
      <a
        href={`tel:${phone.replace(/[^\d+]/g, '')}`}
        className="text-base font-medium text-white transition-opacity hover:opacity-80 md:text-lg"
      >
        {formatUaePhone(phone)}
      </a>
    )}
    {buttonText && (
      <Link
        href="/booking"
        className="relative shrink-0 rounded-xl px-8 py-3.5 text-base font-black tracking-wider text-white uppercase transition-transform duration-200 hover:scale-105 active:scale-95"
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
