'use client';

import type { JSX } from 'react';
import { useMemo } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import LightboxArrow from '@/components/shared/lightbox/LightboxArrow';
import LightboxCloseButton from '@/components/shared/lightbox/LightboxCloseButton';
import LightboxCounter from '@/components/shared/lightbox/LightboxCounter';
import LightboxOverlay from '@/components/shared/lightbox/LightboxOverlay';
import { useLightboxNav } from '@/components/shared/lightbox/useLightboxNav';
import LightboxStage from '@/components/shared/LightboxStage';
import { dictText } from '@/components/utils/dictText';

import type { SalonPhoto } from '../types';

/** Ring styling of the paging arrows — thinner than the gallery viewer's. */
const ARROW_STYLE = { border: '1.5px solid rgba(255,255,255,0.18)' };

/**
 * SalonLightbox — full-screen photo viewer for the salon gallery: dark blurred backdrop, `x / N`
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
  const dict = useDict();
  const total = photos.length;
  const onPrev = () => onSelect((index - 1 + total) % total);
  const onNext = () => onSelect((index + 1) % total);

  const urls = useMemo(() => photos.map((photo) => photo.url), [photos]);
  const { direction, dialogRef, contentRef, requestClose } = useLightboxNav({
    urls,
    index,
    onPrev,
    onNext,
    onClose,
  });

  const photo = photos[index];

  return (
    <LightboxOverlay
      dialogRef={dialogRef}
      label={dictText(dict, 'salon_photo_viewer_aria', 'Salon photo viewer')}
      className="p-4"
      style={{ background: 'rgba(6,0,14,0.94)', backdropFilter: 'blur(16px)' }}
      onClose={requestClose}
    >
      <LightboxCloseButton onClose={requestClose} size={18} />
      <LightboxCounter
        index={index}
        total={total}
        tone="rgba(255,255,255,0.7)"
      />

      <LightboxArrow
        side="prev"
        onClick={onPrev}
        label={dictText(dict, 'previous_text', 'Previous')}
        className="left-6 transition-colors hover:bg-white/10"
        style={ARROW_STYLE}
      />

      {photo && (
        <div ref={contentRef} className="w-full max-w-xl px-4 md:mx-20 md:px-0">
          <LightboxStage
            src={photo.url}
            preview={photo.preview}
            direction={direction}
            onPrev={onPrev}
            onNext={onNext}
            glow={`0 0 80px ${color}33, 0 32px 64px rgba(0,0,0,0.7)`}
          />
        </div>
      )}

      <LightboxArrow
        side="next"
        onClick={onNext}
        label={dictText(dict, 'next_text', 'Next')}
        className="right-6 transition-colors hover:bg-white/10"
        style={ARROW_STYLE}
      />
    </LightboxOverlay>
  );
};

export default SalonLightbox;
