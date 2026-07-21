'use client';

/*
  Fullscreen lightbox viewer. The rule is disabled file-wide because the
  thumbnail strip is made of on-demand overlay micro-thumbnails whose bytes
  don't warrant the optimizer round-trip.
*/
/* eslint-disable @next/next/no-img-element */
import { ChevronLeft, ChevronRight, Share2, X } from 'lucide-react';
import type { JSX } from 'react';
import { useEffect, useMemo } from 'react';

import LightboxStage from '@/components/shared/LightboxStage';
import { useDialogA11y } from '@/components/shared/useDialogA11y';
import { useNeighborPreload } from '@/components/shared/useNeighborPreload';
import { useSlideDirection } from '@/components/shared/useSlideDirection';

import type { GalleryItem } from '../taxonomy';

/**
 * GalleryLightbox — fullscreen photo viewer ported from the static-html mock
 * (`GalleryPage.tsx` → `Lightbox`): blurred dark backdrop, close button,
 * photo counter, prev/next arrows, caption with the master's role and a
 * thumbnail strip. Supports Escape / arrow-key navigation.
 * @param   {object}                  props          - Component properties
 * @param   {GalleryItem[]}           props.items    - Photos of the current filter selection
 * @param   {number}                  props.index    - Index of the opened photo
 * @param   {() => void}              props.onClose  - Close the lightbox
 * @param   {() => void}              props.onPrev   - Show the previous photo
 * @param   {() => void}              props.onNext   - Show the next photo
 * @param   {(index: number) => void} props.onSelect - Jump to a photo by index
 * @returns {JSX.Element}                            Lightbox overlay
 */
const GalleryLightbox = ({
  items,
  index,
  onClose,
  onPrev,
  onNext,
  onSelect,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}): JSX.Element => {
  const item = items[index];

  /** Which way the viewer is paging — drives the stage slide transition. */
  const direction = useSlideDirection(index, items.length);

  /** Warm the neighbouring originals so stepping through feels instant. */
  const urls = useMemo(() => items.map((photo) => photo.url), [items]);
  useNeighborPreload(urls, index);

  /** Arrow-key navigation (Escape / focus-trap / scroll-lock handled by useDialogA11y). */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onPrev, onNext]);

  /** Dialog a11y: focus trap, focus restore, scroll lock and Escape-to-close. */
  const dialogRef = useDialogA11y({ isOpen: true, onClose });

  if (!item) {
    return <></>;
  }

  return (
    <div
      ref={dialogRef}
      data-testid="gallery-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.title ? `Photo: ${item.title}` : 'Photo viewer'}
      className="fixed inset-0 z-300 flex items-center justify-center backdrop-blur-2xl"
      style={{ background: 'rgba(6,0,14,0.94)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-5 right-5 z-10 flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        style={{ border: '1.5px solid rgba(255,255,255,0.25)' }}
      >
        <X size={17} color="#fff" />
      </button>

      {/* Counter */}
      <div
        className="absolute top-5 left-5 rounded-full px-3 py-1.5 text-xs font-medium"
        style={{
          background: 'rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.6)',
        }}
      >
        {index + 1} / {items.length}
      </div>

      {/* Prev */}
      <button
        onClick={onPrev}
        aria-label="Previous photo"
        className="absolute left-4 z-10 flex size-12 items-center justify-center rounded-full backdrop-blur-xs transition-transform hover:scale-110 active:scale-95 md:left-8"
        style={{
          border: '1.5px solid rgba(255,255,255,0.6)',
          background: 'rgba(0,0,0,0.45)',
        }}
      >
        <ChevronLeft size={22} color="#fff" />
      </button>

      {/* Main image + caption + thumbnails */}
      <div className="flex w-full max-w-2xl flex-col items-center gap-4 px-4 md:mx-20 md:px-0">
        <LightboxStage
          src={item.url}
          preview={item.preview}
          alt={item.title}
          direction={direction}
          onPrev={onPrev}
          onNext={onNext}
        />

        {/* Caption */}
        <div className="flex w-full items-center justify-between gap-4 px-1">
          <div>
            <p className="text-lg font-black text-white">{item.title}</p>
            <p className="mt-0.5 text-base text-neutral-300">
              {item.master}
              <span className="text-accent-pink"> · {item.role}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              aria-label="Share"
              className="flex size-9 items-center justify-center rounded-xl transition-colors hover:bg-white/10"
              style={{ border: '1.5px solid rgba(255,255,255,0.14)' }}
            >
              <Share2 size={14} color="#fff" />
            </button>
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="flex w-full justify-center gap-2 overflow-x-auto pb-1">
          {items.map((thumb, thumbIndex) => (
            <button
              key={thumb.id}
              onClick={() => onSelect(thumbIndex)}
              aria-label={`Photo ${thumbIndex + 1}`}
              className="size-11 shrink-0 cursor-pointer overflow-hidden rounded-lg transition-all"
              style={{
                opacity: thumbIndex === index ? 1 : 0.38,
                border:
                  thumbIndex === index
                    ? '2px solid #ed21f1'
                    : '2px solid transparent',
                boxShadow: thumbIndex === index ? '0 0 10px #ed21f155' : 'none',
                transform: thumbIndex === index ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <img
                src={thumb.url}
                alt=""
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Next */}
      <button
        onClick={onNext}
        aria-label="Next photo"
        className="absolute right-4 z-10 flex size-12 items-center justify-center rounded-full backdrop-blur-xs transition-transform hover:scale-110 active:scale-95 md:right-8"
        style={{
          border: '1.5px solid rgba(255,255,255,0.6)',
          background: 'rgba(0,0,0,0.45)',
        }}
      >
        <ChevronRight size={22} color="#fff" />
      </button>
    </div>
  );
};

export default GalleryLightbox;
