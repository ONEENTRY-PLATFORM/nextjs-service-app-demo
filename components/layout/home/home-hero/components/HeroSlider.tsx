'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { CSSProperties, JSX } from 'react';
import { useEffect, useState } from 'react';

import { useHeroRef } from '@/app/animations/hero/useHeroRef';
import { useDict } from '@/app/store/providers/useDict';
import Image from '@/components/shared/Image';
import { dictText } from '@/components/utils/dictText';

import HeroSlideOverlayDesktop from './HeroSlideOverlayDesktop';
import HeroSlideOverlayMobile from './HeroSlideOverlayMobile';

/**
 * A single hero slide: desktop/mobile banner images plus the optional CMS text
 * overlay (title, subtitle, sale badge and CTA button). Empty text fields are
 * simply not rendered.
 * @property {string} desktop       - Desktop banner image URL
 * @property {string} mobile        - Mobile banner image URL
 * @property {string} [desktopBlur] - Ready-made CMS LQIP of the desktop banner; absent when the file has no `previewLink`
 * @property {string} [mobileBlur]  - Ready-made CMS LQIP of the mobile banner; absent when the file has no `previewLink`
 * @property {string} title         - Overlay heading
 * @property {string} text          - Overlay subtitle
 * @property {string} sale          - Sale badge text
 * @property {string} buttonText    - CTA button label
 * @property {string} buttonLink    - CTA button target URL
 */
export type HeroSlide = {
  desktop: string;
  mobile: string;
  desktopBlur?: string | undefined;
  mobileBlur?: string | undefined;
  title: string;
  text: string;
  sale: string;
  buttonText: string;
  buttonLink: string;
};

/**
 * Hero banner carousel: full-bleed slides with a
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
  const dict = useDict();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const current = slides[idx];
  const bgRef = useHeroRef('bg');

  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = (): void => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  /** Auto-advance the carousel, paused on hover / keyboard focus / reduced-motion */
  useEffect(() => {
    if (paused || reduceMotion || count < 2) {
      return;
    }
    const timer = setInterval(() => setIdx((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(timer);
  }, [paused, reduceMotion, count, intervalMs]);

  return (
    <section
      className="relative aspect-390/535 min-h-133.75 w-full overflow-hidden bg-[linear-gradient(90deg,#c082ff_0%,#ed21f1_90%)] select-none md:aspect-auto md:h-140 lg:aspect-1920/600 lg:h-auto lg:min-h-150"
      style={{ '--hero-u': 'clamp(15px, 1vw, 19.2px)' } as CSSProperties}
      aria-roledescription="carousel"
      aria-label={dictText(dict, 'promotions_aria', 'Promotions')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div ref={bgRef} className="absolute inset-0">
        {slides.map((slide, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== idx}
            className={
              'absolute inset-0 transition-opacity duration-700 ' +
              (i === idx ? 'opacity-100' : 'pointer-events-none opacity-0')
            }
          >
            {slide.desktop && (
              <Image
                loading={i === 0 ? 'eager' : 'lazy'}
                src={slide.desktop}
                alt={alt}
                sizes="(min-width: 768px) 100vw, 1px"
                placeholder={slide.desktopBlur ? 'blur' : 'empty'}
                {...(slide.desktopBlur
                  ? { blurDataURL: slide.desktopBlur }
                  : {})}
                className="absolute inset-0 hidden md:block"
              />
            )}
            {slide.mobile && (
              <Image
                priority={i === 0 ? 'high' : 'auto'}
                src={slide.mobile}
                alt={alt}
                sizes="(min-width: 768px) 1px, 100vw"
                placeholder={slide.mobileBlur ? 'blur' : 'empty'}
                {...(slide.mobileBlur ? { blurDataURL: slide.mobileBlur } : {})}
                className="absolute inset-0 md:hidden"
              />
            )}

            {/* Mobile overlay. */}
            <HeroSlideOverlayMobile
              sale={slide.sale}
              title={slide.title}
              text={slide.text}
              buttonText={slide.buttonText}
              buttonLink={slide.buttonLink}
            />

            {/* Desktop CMS text overlay. */}
            <HeroSlideOverlayDesktop
              sale={slide.sale}
              title={slide.title}
              text={slide.text}
            />
          </div>
        ))}
      </div>

      {/* Desktop CTA. */}
      {current && (
        <Link
          href={current.buttonLink || '/offers'}
          className="absolute right-[3.33em] bottom-[2.83em] z-10 hidden h-[2.5em] w-[12.5em] items-center justify-center rounded-[0.83em] bg-white/80 font-normal tracking-widest text-charcoal uppercase transition-colors hover:bg-white lg:inline-flex"
          style={{ fontSize: 'calc(var(--hero-u) * 1.25)' }}
        >
          {current.buttonText ||
            dictText(dict, 'discover_more_text', 'Discover More')}
        </Link>
      )}

      {count > 1 && (
        <>
          {/* Prev / next arrows */}
          <button
            aria-label={dictText(dict, 'previous_slide_aria', 'Previous slide')}
            onClick={() => setIdx((idx - 1 + count) % count)}
            className="absolute top-1/2 left-3 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/35 md:left-5"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            aria-label={dictText(dict, 'next_slide_aria', 'Next slide')}
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
                aria-label={`${dictText(dict, 'go_to_slide_aria', 'Go to slide')} ${i + 1}`}
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
