'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';

import { useHeroRef } from '@/app/animations/HeroAnimations';

import SaleText from './SaleText';

/**
 * A single hero slide: desktop/mobile banner images plus the optional CMS text
 * overlay (title, subtitle, sale badge and CTA button). Empty text fields are
 * simply not rendered.
 */
export type HeroSlide = {
  desktop: string;
  mobile: string;
  title: string;
  text: string;
  sale: string;
  buttonText: string;
  buttonLink: string;
};

/**
 * Hero banner carousel, as in the static-html mock: full-bleed slides with a
 * crossfade, auto-advance (paused on hover), prev/next arrows and dots.
 * Controls are hidden while there is only one slide.
 * @param   {object}      props            - Component properties
 * @param   {HeroSlide[]} props.slides     - Slides to display
 * @param   {number}      props.intervalMs - Auto-advance interval in milliseconds
 * @param   {string}      props.alt        - Alt text for the banner images
 * @returns {JSX.Element}                  JSX.Element representing the hero slider
 */
const HeroSlider = ({
  slides,
  intervalMs,
  alt,
}: {
  slides: HeroSlide[];
  intervalMs: number;
  alt: string;
}): JSX.Element => {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  /** Current slide — drives the single CTA button */
  const current = slides[idx];
  /** Registers the slides layer as the hero `bg` for the parallax timeline */
  const bgRef = useHeroRef('bg');

  /** Auto-advance the carousel, paused on hover */
  useEffect(() => {
    if (paused || count < 2) {
      return;
    }
    const timer = setInterval(() => setIdx((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(timer);
  }, [paused, count, intervalMs]);

  return (
    <section
      className="relative aspect-390/535 w-full overflow-hidden bg-[linear-gradient(90deg,#49268b_3%,#ed21f1_90%)] select-none md:aspect-1920/600"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides — crossfade; each carries its optional CMS text overlay
          (sale badge, title, subtitle) on the left. */}
      <div ref={bgRef} className="absolute inset-0">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={
              'absolute inset-0 transition-opacity duration-700 ' +
              (i === idx ? 'opacity-100' : 'pointer-events-none opacity-0')
            }
          >
            {/*
              Only ONE variant of the first slide may be `priority`: two
              priority images preload on every viewport and compete as LCP
              candidates, even though CSS shows just one of them. The mobile
              variant keeps the preload (mobile-first traffic); the desktop
              variant still loads eagerly, just without its own preload link.
            */}
            {/*
              `sizes` must mirror the CSS breakpoint that shows each variant.
              With a flat `sizes="100vw"` both variants claim the full viewport,
              so the browser downloads a viewport-wide JPEG for the one that is
              `display:none` too — Next.js flags exactly this ("image is not
              rendered at full viewport width"). Claiming `1px` outside its own
              range makes the hidden variant resolve to the smallest srcset
              candidate instead. `768px` is Tailwind's default `md`.
            */}
            {slide.desktop && (
              <Image
                fill
                loading={i === 0 ? 'eager' : 'lazy'}
                src={slide.desktop}
                alt={alt}
                sizes="(min-width: 768px) 100vw, 1px"
                className="hidden object-cover md:block"
              />
            )}
            {slide.mobile && (
              <Image
                fill
                priority={i === 0}
                src={slide.mobile}
                alt={alt}
                sizes="(min-width: 768px) 1px, 100vw"
                className="object-cover md:hidden"
              />
            )}

            {/* CMS text overlay — sale badge, title and subtitle from the slide,
                vertically centered on the left. Empty fields are not rendered. */}
            {(slide.sale || slide.title || slide.text) && (
              <div className="absolute inset-y-0 left-16 z-10 flex max-w-[68%] flex-col items-start justify-center gap-3 pr-5 md:left-[7%] md:gap-5">
                {/* League Gothic goes on the sale badge and the title only — the
                    subtitle below stays on the site's default Lato, as in the
                    promo artwork. Hence the per-element `fontFamily` instead of
                    one on this wrapper, which would inherit down to all three. */}
                {slide.sale && (
                  <div className="flex aspect-square w-64 items-center justify-center rounded-full border border-white/40 bg-fuchsia-500/35 backdrop-blur-md md:w-[12vw] md:max-w-44">
                    <span
                      className="px-2 text-center text-[clamp(8rem,3vw,8rem)] leading-none text-nowrap text-white"
                      style={{ fontFamily: 'var(--font-league-gothic)' }}
                    >
                      <SaleText text={slide.sale} />
                    </span>
                  </div>
                )}
                {slide.title && (
                  <h1
                    className="text-5xl leading-none text-white md:text-7xl lg:text-8xl"
                    style={{ fontFamily: 'var(--font-league-gothic)' }}
                  >
                    {slide.title}
                  </h1>
                )}
                {slide.text && (
                  <p className="text-lg font-light tracking-wide text-white/85 md:text-2xl">
                    {slide.text}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA — a single "Discover More" button on the site rails: bottom-left on
          mobile (aligned under the banner's baked text), bottom-right on desktop. */}
      {current && (
        <div className="pointer-events-none absolute inset-0 z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-3 pt-6 pb-16 md:px-8 md:py-10">
          <div className="flex items-end justify-start pl-2.75 md:justify-end md:pl-0">
            <Link
              href={current.buttonLink || '/offers'}
              className="pointer-events-auto inline-flex min-w-50 items-center justify-center rounded-xl bg-white px-7 py-3.5 text-base font-normal tracking-[0.2em] text-ink uppercase transition-colors hover:bg-gray-50"
            >
              {current.buttonText || 'Discover More'}
            </Link>
          </div>
        </div>
      )}

      {count > 1 && (
        <>
          {/* Prev / next arrows */}
          <button
            aria-label="Previous slide"
            onClick={() => setIdx((idx - 1 + count) % count)}
            className="absolute top-1/2 left-3 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/35 md:left-5"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            aria-label="Next slide"
            onClick={() => setIdx((idx + 1) % count)}
            className="absolute top-1/2 right-3 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/35 md:right-5"
          >
            <ChevronRight size={22} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIdx(i)}
                className={
                  'h-2 rounded-full transition-all duration-300 ' +
                  (i === idx ? 'w-6.5 bg-white' : 'w-2 bg-white/50')
                }
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSlider;
