'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';

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
      {/* Slides — crossfade (no zoom so the baked-in text edges stay visible) */}
      <div className="hero-bg absolute inset-0">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={
              'absolute inset-0 transition-opacity duration-700 ' +
              (i === idx ? 'opacity-100' : 'pointer-events-none opacity-0')
            }
          >
            {slide.desktop && (
              <Image
                fill
                priority={i === 0}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                src={slide.desktop}
                alt={alt}
                sizes="100vw"
                className="hidden object-cover md:block"
              />
            )}
            {slide.mobile && (
              <Image
                fill
                priority={i === 0}
                src={slide.mobile}
                alt={alt}
                sizes="100vw"
                className="object-cover md:hidden"
              />
            )}

            {/* CMS text overlay — text column on the left (sale badge, title,
                subtitle); the CTA button sits bottom-right, as in the mock. */}
            {(slide.sale || slide.title || slide.text) && (
              <div
                className="absolute inset-y-0 left-16 z-10 flex max-w-[68%] flex-col items-start justify-center gap-3 pr-5 md:left-[7%] md:gap-5"
                style={{ fontFamily: 'var(--font-oswald)' }}
              >
                {slide.sale && (
                  <div className="flex aspect-square w-20 items-center justify-center rounded-full border border-white/40 bg-fuchsia-500/35 backdrop-blur-md md:w-28 lg:w-32">
                    <span className="px-2 text-center text-xl leading-none font-semibold text-white md:text-3xl">
                      {slide.sale}
                    </span>
                  </div>
                )}
                {slide.title && (
                  <h1 className="text-5xl leading-none font-medium text-white md:text-7xl lg:text-8xl">
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
            {slide.buttonText && (
              <Link
                href={slide.buttonLink || '#'}
                className="absolute right-5 bottom-14 z-10 inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-normal tracking-[0.2em] text-ink uppercase transition-colors hover:bg-gray-50 md:right-[6%] md:bottom-[14%] md:text-base"
              >
                {slide.buttonText}
              </Link>
            )}
          </div>
        ))}
      </div>

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
