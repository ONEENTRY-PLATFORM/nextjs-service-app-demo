import Link from 'next/link';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';

import SaleText from './SaleText';

/**
 * HeroSlideOverlayMobile — the mobile (`md:hidden`) text overlay of a hero slide.
 * @param   {object}      props            - Component properties
 * @param   {string}      props.sale       - Badge text (e.g. "-15%"), empty to hide
 * @param   {string}      props.title      - Slide title, empty to hide
 * @param   {string}      props.text       - Slide subtitle, empty to hide
 * @param   {string}      props.buttonText - CTA label (falls back to "Discover More")
 * @param   {string}      props.buttonLink - CTA href (falls back to "/offers")
 * @returns {JSX.Element}                  JSX.Element with the mobile slide overlay
 */
const HeroSlideOverlayMobile = ({
  sale,
  title,
  text,
  buttonText,
  buttonLink,
}: {
  sale: string;
  title: string;
  text: string;
  buttonText: string;
  buttonLink: string;
}): JSX.Element => {
  const dict = useDict();
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-start gap-25 p-10 md:p-14 lg:hidden">
      {sale && (
        <div className="-mb-14.5 flex aspect-square w-48.5 shrink-0 items-center justify-center rounded-full bg-logo-dot/60">
          <span
            className="px-2 text-center text-[88px] text-nowrap text-white/80 [text-box:trim-both_cap_alphabetic]"
            style={{
              fontFamily: 'var(--font-league-gothic)',
              lineHeight: 0.915,
            }}
          >
            <SaleText text={sale} percentSize="0.51em" />
          </span>
        </div>
      )}

      <div className="flex w-full flex-col gap-10">
        <div className="flex flex-col gap-2.5">
          {title && (
            <h1
              className="text-[64px] leading-none text-white/80 md:text-[72px]"
              style={{
                fontFamily: 'var(--font-league-gothic)',
                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              {title}
            </h1>
          )}
          {text && (
            <p className="text-2xl leading-none font-light text-white capitalize md:text-[28px]">
              {text}
            </p>
          )}
        </div>

        {(buttonText || buttonLink) && (
          <Link
            href={buttonLink || '/offers'}
            className="pointer-events-auto inline-flex h-10 w-57.5 items-center justify-center rounded-[10px] bg-white/80 text-base tracking-widest text-charcoal uppercase transition-colors hover:bg-white md:h-11 md:w-64"
          >
            {buttonText ||
              (dict?.discover_more_text?.value as string | undefined) ||
              'Discover More'}
          </Link>
        )}
      </div>
    </div>
  );
};

export default HeroSlideOverlayMobile;
