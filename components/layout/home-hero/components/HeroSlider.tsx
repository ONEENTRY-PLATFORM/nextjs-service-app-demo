'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';

/** A single hero slide: desktop and mobile banner images. */
export type HeroSlide = {
  desktop: string;
  mobile: string;
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
