'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { JSX } from 'react';
import { useEffect } from 'react';

/** A single portfolio image with its full/thumbnail/preview sources. */
type PortfolioImage = {
  img: string;
  thumb: string;
  preview: string;
  alt: string;
};

/**
 * PortfolioLightbox component — a custom full-screen portfolio viewer.
 *
 * Renders a dark blurred backdrop with a counter pill, ring-bordered prev/next
 * controls, a pink-glow image, a caption (master name + PINK role) and a
 * thumbnail strip whose active thumb is pink-bordered and scaled up. Supports
 * Esc / ArrowLeft / ArrowRight keyboard navigation.
 * @param   {object}              props            - Component properties.
 * @param   {PortfolioImage[]}    props.images     - All portfolio images.
 * @param   {number}              props.index      - Index of the currently shown image.
 * @param   {string}              props.masterName - Master name for the caption.
 * @param   {string}              props.role       - Master role line for the caption.
 * @param   {() => void}          props.onClose    - Close handler.
 * @param   {(i: number) => void} props.onSelect   - Handler to switch to another image index.
 * @returns {JSX.Element | null}                   JSX.Element representing the lightbox, or null when the index is out of range.
 */
const PortfolioLightbox = ({
  images,
  index,
  masterName,
  role,
  onClose,
  onSelect,
}: {
  images: PortfolioImage[];
  index: number;
  masterName: string;
  role: string;
  onClose: () => void;
  onSelect: (i: number) => void;
}): JSX.Element | null => {
  const count = images.length;
  const current = images[index];

  /** Keyboard navigation: Esc closes, arrows move between photos. */
  useEffect(() => {
    if (count === 0) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onSelect((index - 1 + count) % count);
      } else if (e.key === 'ArrowRight') {
        onSelect((index + 1) % count);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, count, onClose, onSelect]);

  /** Out-of-range guard (noUncheckedIndexedAccess). */
  if (!current) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-300 flex items-center justify-center"
      style={{ background: 'rgba(8,0,14,0.92)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
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
        {index + 1} / {count}
      </div>

      {/* Prev */}
      <button
        onClick={() => onSelect((index - 1 + count) % count)}
        aria-label="Previous"
        className="absolute left-4 z-10 flex size-12 items-center justify-center rounded-full transition-colors md:left-8"
        style={{
          border: '1.5px solid rgba(255,255,255,0.6)',
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <ChevronLeft size={22} color="#fff" />
      </button>

      {/* Stage */}
      <div className="flex w-full max-w-2xl flex-col items-center gap-4 px-4 md:mx-20 md:px-0">
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{
            boxShadow: '0 0 80px #ed21f122, 0 32px 64px rgba(0,0,0,0.7)',
          }}
        >
          {/*
            Stage image at natural dimensions bounded by the viewport
            (`max-h-[70vh]`); next/image needs a fixed width/height or a sized
            `fill` box, so a raw <img> is the right tool for the lightbox.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.img}
            alt={current.alt}
            className="max-h-[70vh] w-full object-cover"
          />
        </div>

        {/* Caption */}
        <div className="w-full px-1">
          <p className="truncate text-lg font-black text-white">{masterName}</p>
          {role ? (
            <p
              className="mt-0.5 truncate text-base"
              style={{ color: '#ed21f1' }}
            >
              {role}
            </p>
          ) : null}
        </div>

        {/* Thumbnail strip */}
        <div className="flex w-full justify-center gap-2 overflow-x-auto pb-1">
          {images.map((item, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              aria-label={`Show image ${i + 1}`}
              className="size-11 shrink-0 overflow-hidden rounded-lg transition-all"
              style={{
                opacity: i === index ? 1 : 0.38,
                border:
                  i === index ? '2px solid #ed21f1' : '2px solid transparent',
                boxShadow: i === index ? '0 0 10px #ed21f155' : 'none',
                transform: i === index ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              {/* On-demand overlay micro-thumbnail — raw <img>, see the stage note above. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.thumb} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Next */}
      <button
        onClick={() => onSelect((index + 1) % count)}
        aria-label="Next"
        className="absolute right-4 z-10 flex size-12 items-center justify-center rounded-full transition-colors md:right-8"
        style={{
          border: '1.5px solid rgba(255,255,255,0.6)',
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <ChevronRight size={22} color="#fff" />
      </button>
    </div>
  );
};

export default PortfolioLightbox;
