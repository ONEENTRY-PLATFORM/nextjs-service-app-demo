'use client';

/*
  Fullscreen lightbox viewer: the stage image renders at its natural dimensions
  bounded by the viewport (`max-h-[85vh] max-w-[85vw]`), which next/image can't
  do without a fixed width/height or a sized `fill` box — so a raw <img> is the
  right tool and the rule is disabled for this single-image viewer.
*/
/* eslint-disable @next/next/no-img-element */
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { JSX } from 'react';
import { useEffect } from 'react';

/**
 * SalonLightbox — full-screen photo viewer for the salon gallery, ported from
 * the static-html mock (`SalonPage.tsx`): dark blurred backdrop, `x / N`
 * counter, ring-bordered prev/next arrows, accent-glow image, and Esc/Arrow
 * keyboard navigation.
 * @param   {object}              props          - Component properties
 * @param   {string[]}            props.photos   - All gallery photo URLs
 * @param   {number}              props.index    - Active photo index
 * @param   {string}              props.color    - Accent color (hex) for the image glow
 * @param   {() => void}          props.onClose  - Close the lightbox
 * @param   {(i: number) => void} props.onSelect - Jump to a photo index
 * @returns {JSX.Element}                        Lightbox overlay
 */
const SalonLightbox = ({
  photos,
  index,
  color,
  onClose,
  onSelect,
}: {
  photos: string[];
  index: number;
  color: string;
  onClose: () => void;
  onSelect: (i: number) => void;
}): JSX.Element => {
  const total = photos.length;
  const prev = () => onSelect((index - 1 + total) % total);
  const next = () => onSelect((index + 1) % total);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onSelect((index - 1 + total) % total);
      if (e.key === 'ArrowRight') onSelect((index + 1) % total);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, total, onClose, onSelect]);

  const src = photos[index];

  return (
    <div
      className="fixed inset-0 z-150 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,0,14,0.94)', backdropFilter: 'blur(16px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        style={{ border: '1.5px solid rgba(255,255,255,0.25)' }}
      >
        <X size={18} color="#fff" />
      </button>
      <div
        className="absolute top-5 left-5 rounded-full px-3 py-1.5 text-xs font-medium"
        style={{
          background: 'rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        {index + 1} / {total}
      </div>

      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-6 flex size-12 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        style={{ border: '1.5px solid rgba(255,255,255,0.18)' }}
      >
        <ChevronLeft size={22} color="#fff" />
      </button>

      {src && (
        <img
          src={src}
          alt=""
          className="max-h-[85vh] max-w-[85vw] rounded-2xl"
          style={{
            boxShadow: `0 0 80px ${color}33, 0 32px 64px rgba(0,0,0,0.7)`,
          }}
        />
      )}

      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-6 flex size-12 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        style={{ border: '1.5px solid rgba(255,255,255,0.18)' }}
      >
        <ChevronRight size={22} color="#fff" />
      </button>
    </div>
  );
};

export default SalonLightbox;
