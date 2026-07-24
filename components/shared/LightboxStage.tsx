'use client';

/*
  The stage renders full-size CMS originals inside a fixed overlay box, so both
  images here are raw `<img>`: next/image would re-optimize photos the CDN has
  already sized, and the LQIP layer is an inline data URI that must never reach
  the optimizer.
*/
/* eslint-disable @next/next/no-img-element */
import type { JSX } from 'react';
import { useState } from 'react';

import SlideAnimations from '@/app/animations/SlideAnimations';

/** A lightbox photo: the full-size source plus its blur placeholder. */
type StagePhoto = {
  src: string;
  preview: string | null;
  alt: string;
};

/**
 * LightboxStage — the main photo of a lightbox: a fixed-size box that shows the
 * LQIP blur placeholder first, cross-fades the full-size original in when it
 * arrives, and pages between photos with `SlideAnimations`.
 *
 * The box keeps its size regardless of the load state. A bare `<img>` sized by
 * its natural dimensions collapses to zero height until the original lands,
 * which is what left the empty hole in the middle of the viewer while a large
 * photo was downloading.
 * @param   {object}        props             - Component properties
 * @param   {string}        props.src         - Full-size photo URL
 * @param   {string | null} [props.preview]   - Base64 LQIP shown while the photo loads
 * @param   {string}        [props.alt]       - Alternative text for the photo
 * @param   {1 | -1}        [props.direction] - Page-turn direction (see `useSlideDirection`)
 * @param   {() => void}    [props.onPrev]    - Page to the previous photo (enables drag paging)
 * @param   {() => void}    [props.onNext]    - Page to the next photo (enables drag paging)
 * @param   {string}        [props.aspect]    - Tailwind aspect-ratio class of the stage box
 * @param   {string}        [props.glow]      - `box-shadow` of the stage box
 * @returns {JSX.Element}                     Stage box with the photo
 */
const LightboxStage = ({
  src,
  preview = null,
  alt = '',
  direction = 1,
  onPrev,
  onNext,
  aspect = 'aspect-4/5',
  glow = '0 0 80px #ed21f122, 0 32px 64px rgba(0,0,0,0.7)',
}: {
  src: string;
  preview?: string | null | undefined;
  alt?: string | undefined;
  direction?: 1 | -1 | undefined;
  onPrev?: (() => void) | undefined;
  onNext?: (() => void) | undefined;
  aspect?: string | undefined;
  glow?: string | undefined;
}): JSX.Element => {
  /**
   * The source whose bytes are on screen. Storing the URL rather than a boolean
   * resets the fade for free when the photo changes: the `<img>` element is
   * reused across slides, so a boolean would stay `true` and reveal the next
   * photo before it had loaded.
   */
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  return (
    <SlideAnimations<StagePhoto>
      slide={{ src, preview, alt }}
      slideKey={src}
      direction={direction}
      distance={120}
      duration={0.42}
      onPrev={onPrev}
      onNext={onNext}
      className={`relative w-full ${aspect} max-h-[70vh] cursor-grab touch-pan-y overflow-hidden rounded-2xl select-none active:cursor-grabbing`}
      style={{ boxShadow: glow }}
    >
      {(photo) => (
        <>
          {photo.preview ? (
            <img
              src={photo.preview}
              alt=""
              aria-hidden
              draggable={false}
              className="absolute inset-0 size-full scale-110 object-cover blur-xl"
            />
          ) : (
            <div
              className={`absolute inset-0 bg-white/5 ${
                loadedSrc === photo.src ? '' : 'animate-pulse'
              }`}
            />
          )}

          <img
            src={photo.src}
            alt={photo.alt}
            // The native image drag would swallow the paging gesture.
            draggable={false}
            // A photo already in the browser cache can finish before React
            // attaches `onLoad` — the ref catches that first-mount race.
            ref={(node) => {
              if (node?.complete && node.naturalWidth > 0) {
                setLoadedSrc(photo.src);
              }
            }}
            onLoad={() => setLoadedSrc(photo.src)}
            className="absolute inset-0 size-full object-cover transition-opacity duration-500 ease-out"
            style={{ opacity: loadedSrc === photo.src ? 1 : 0 }}
          />
        </>
      )}
    </SlideAnimations>
  );
};

export default LightboxStage;
