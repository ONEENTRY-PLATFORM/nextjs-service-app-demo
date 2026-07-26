'use client';

/*
  The strip is made of on-demand overlay micro-thumbnails whose bytes don't
  warrant the image optimizer round-trip, so they stay raw <img> elements.
*/
/* eslint-disable @next/next/no-img-element */
import type { JSX } from 'react';
import { useEffect, useRef } from 'react';

/** One entry of the strip: what to show and how to key it. */
export interface LightboxThumb {
  /** React key — the photo id where there is one, else the index */
  key: string | number;
  /** Thumbnail source */
  src: string;
  /** `aria-label` of the button */
  label: string;
}

/**
 * LightboxThumbStrip — the row of micro-thumbnails under the stage. The active
 * thumb is pink-bordered, fully opaque, glowing and scaled up; the rest are
 * dimmed, so the position in the set reads at a glance.
 * @param   {object}                  props          - Component properties
 * @param   {LightboxThumb[]}         props.thumbs   - Thumbnails in display order
 * @param   {number}                  props.index    - Index of the photo on screen
 * @param   {(index: number) => void} props.onSelect - Jump to a photo by index
 * @returns {JSX.Element}                            Thumbnail strip
 */
const LightboxThumbStrip = ({
  thumbs,
  index,
  onSelect,
}: {
  thumbs: LightboxThumb[];
  index: number;
  onSelect: (index: number) => void;
}): JSX.Element => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  /*
    Keep the active thumb centred as the photo changes. We move the strip's own
    scrollLeft (never `scrollIntoView`, which would also scroll the overlay
    page) so the current selection always stays visible with the scrollbar
    hidden.
  */
  useEffect(() => {
    const strip = scrollRef.current;
    const active = activeRef.current;
    if (!strip || !active) {
      return;
    }
    const stripRect = strip.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const delta =
      activeRect.left -
      stripRect.left -
      (strip.clientWidth - active.clientWidth) / 2;
    strip.scrollTo({ left: strip.scrollLeft + delta, behavior: 'smooth' });
  }, [index]);

  return (
    <div
      ref={scrollRef}
      className="mx-auto no-scrollbar flex w-fit max-w-full gap-2 overflow-x-auto px-2 py-3"
    >
      {thumbs.map((thumb, thumbIndex) => {
        const active = thumbIndex === index;
        return (
          <button
            key={thumb.key}
            ref={active ? activeRef : undefined}
            onClick={() => onSelect(thumbIndex)}
            aria-label={thumb.label}
            className="size-11 shrink-0 cursor-pointer overflow-hidden rounded-lg transition-all"
            style={{
              opacity: active ? 1 : 0.38,
              border: active ? '2px solid #ed21f1' : '2px solid transparent',
              boxShadow: active ? '0 0 10px #ed21f155' : 'none',
              transform: active ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <img
              src={thumb.src}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          </button>
        );
      })}
    </div>
  );
};

export default LightboxThumbStrip;
