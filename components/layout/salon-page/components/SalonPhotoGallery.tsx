'use client';

import NextImage from 'next/image';
import type { JSX, UIEvent } from 'react';
import { useState } from 'react';

import type { SalonPhoto } from '../types';

/**
 * Blur-placeholder props for a photo, empty when it carries no LQIP.
 *
 * next/image rejects `placeholder="blur"` without a `blurDataURL`, and
 * `exactOptionalPropertyTypes` forbids passing the key as `undefined` — so the
 * pair is spread in or left out entirely.
 * @param   {SalonPhoto} photo - Photo to place
 * @returns {object}           Props to spread onto `next/image`
 */
const blurProps = (
  photo: SalonPhoto,
): { placeholder: 'blur'; blurDataURL: string } | Record<string, never> =>
  photo.preview
    ? { placeholder: 'blur' as const, blurDataURL: photo.preview }
    : {};

/**
 * SalonPhotoGallery — the salon photo gallery ported from the static-html mock
 * (`SalonPage.tsx` → PhotoGallery): a swipe carousel with dots on mobile and a
 * hero + thumbnail grid on desktop. Every tile opens the lightbox via `onOpen`.
 * @param   {object}              props        - Component properties
 * @param   {SalonPhoto[]}        props.photos - Photos with their LQIP placeholders
 * @param   {string}              props.accent - Accent color (hex) for the dots
 * @param   {(i: number) => void} props.onOpen - Open the lightbox at an index
 * @returns {JSX.Element}                      Responsive photo gallery
 */
const SalonPhotoGallery = ({
  photos,
  accent,
  onOpen,
}: {
  photos: SalonPhoto[];
  accent: string;
  onOpen: (i: number) => void;
}): JSX.Element => {
  const [active, setActive] = useState(0);
  const hero = photos[0];
  const rest = photos.slice(1);

  /**
   * Track the closest snapped photo to drive the mobile dots.
   * @param   {UIEvent<HTMLDivElement>} e - Scroll event from the carousel track
   * @returns {void}
   */
  const onScroll = (e: UIEvent<HTMLDivElement>): void => {
    const el = e.currentTarget;
    let closest = 0;
    let min = Infinity;
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i] as HTMLElement | undefined;
      if (!child) continue;
      const d = Math.abs(child.offsetLeft - el.scrollLeft);
      if (d < min) {
        min = d;
        closest = i;
      }
    }
    setActive(closest);
  };

  return (
    <>
      {/* Mobile: swipe carousel + dots */}
      <div className="lg:hidden">
        <div
          onScroll={onScroll}
          className="-mx-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => onOpen(i)}
              aria-label={`Open salon photo ${i + 1}`}
              className="relative aspect-5/4 w-[86%] shrink-0 snap-center overflow-hidden rounded-2xl"
            >
              <NextImage
                src={photo.url}
                alt=""
                fill
                sizes="86vw"
                className="object-cover"
                {...blurProps(photo)}
              />
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {photos.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: active === i ? 18 : 6,
                background: active === i ? accent : `${accent}40`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Desktop: hero + thumbnail grid */}
      <div className="hidden gap-2 lg:grid lg:grid-cols-[1.4fr_1fr] lg:items-stretch">
        {hero && (
          <button
            onClick={() => onOpen(0)}
            aria-label="Open salon photo 1"
            className="group relative aspect-5/4 overflow-hidden rounded-2xl lg:aspect-auto lg:h-full lg:min-h-100"
          >
            <NextImage
              src={hero.url}
              alt=""
              fill
              sizes="(min-width: 1024px) 40vw, 86vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              {...blurProps(hero)}
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `linear-gradient(160deg, ${accent}44, transparent 60%)`,
              }}
            />
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          {rest.slice(0, 6).map((photo, i) => {
            const isLastWithMore = i === 5 && rest.length > 6;
            const moreCount = rest.length - 6;
            return (
              <button
                key={i}
                onClick={() => onOpen(i + 1)}
                aria-label={
                  isLastWithMore
                    ? `View ${moreCount} more salon photos`
                    : `Open salon photo ${i + 2}`
                }
                className="group relative aspect-5/4 overflow-hidden rounded-2xl"
              >
                <NextImage
                  src={photo.url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 20vw, 86vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  {...blurProps(photo)}
                />
                {isLastWithMore && (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-[1.4rem] font-black text-white"
                    style={{ background: 'rgba(0,0,0,0.45)' }}
                  >
                    +{moreCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default SalonPhotoGallery;
