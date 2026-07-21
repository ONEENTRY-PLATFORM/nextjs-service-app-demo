'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { JSX } from 'react';
import { useEffect, useMemo } from 'react';

import LightboxStage from '@/components/shared/LightboxStage';
import { useDialogA11y } from '@/components/shared/useDialogA11y';
import { useNeighborPreload } from '@/components/shared/useNeighborPreload';
import { useSlideDirection } from '@/components/shared/useSlideDirection';

import type { SalonPhoto } from '../types';

/**
 * SalonLightbox — full-screen photo viewer for the salon gallery, ported from
 * the static-html mock (`SalonPage.tsx`): dark blurred backdrop, `x / N`
 * counter, ring-bordered prev/next arrows, accent-glow image, and Esc/Arrow
 * keyboard navigation.
 * @param   {object}              props          - Component properties
 * @param   {SalonPhoto[]}        props.photos   - All gallery photos with their LQIP placeholders
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
  photos: SalonPhoto[];
  index: number;
  color: string;
  onClose: () => void;
  onSelect: (i: number) => void;
}): JSX.Element => {
  const total = photos.length;
  const prev = () => onSelect((index - 1 + total) % total);
  const next = () => onSelect((index + 1) % total);

  /** Which way the viewer is paging — drives the stage slide transition. */
  const direction = useSlideDirection(index, total);

  /** Warm the neighbouring originals so stepping through feels instant. */
  const urls = useMemo(() => photos.map((photo) => photo.url), [photos]);
  useNeighborPreload(urls, index);

  /** Arrow-key navigation (Escape / focus-trap / scroll-lock handled by useDialogA11y). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onSelect((index - 1 + total) % total);
      if (e.key === 'ArrowRight') onSelect((index + 1) % total);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, total, onSelect]);

  /** Dialog a11y: focus trap, focus restore, scroll lock and Escape-to-close. */
  const dialogRef = useDialogA11y({ isOpen: true, onClose });

  const photo = photos[index];

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Salon photo viewer"
      /* z-300 like the gallery and portfolio viewers: the fixed header sits at
         z-245, so a lower level lets it cover the close button and counter. */
      className="fixed inset-0 z-300 flex items-center justify-center p-4"
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

      {photo && (
        <div className="w-full max-w-xl px-4 md:mx-20 md:px-0">
          <LightboxStage
            src={photo.url}
            preview={photo.preview}
            direction={direction}
            onPrev={prev}
            onNext={next}
            glow={`0 0 80px ${color}33, 0 32px 64px rgba(0,0,0,0.7)`}
          />
        </div>
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
