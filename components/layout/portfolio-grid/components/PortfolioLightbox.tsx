'use client';

import { Share2 } from 'lucide-react';
import type { JSX } from 'react';
import { useMemo } from 'react';

import LightboxArrow from '@/components/shared/lightbox/LightboxArrow';
import LightboxCloseButton from '@/components/shared/lightbox/LightboxCloseButton';
import LightboxCounter from '@/components/shared/lightbox/LightboxCounter';
import LightboxOverlay from '@/components/shared/lightbox/LightboxOverlay';
import LightboxThumbStrip from '@/components/shared/lightbox/LightboxThumbStrip';
import { useLightboxNav } from '@/components/shared/lightbox/useLightboxNav';
import LightboxStage from '@/components/shared/LightboxStage';

/** A single portfolio image with its full/thumbnail/preview sources. */
type PortfolioImage = {
  img: string;
  thumb: string;
  preview: string;
  alt: string;
};

/** Ring + backdrop styling of the paging arrows. */
const ARROW_STYLE = {
  border: '1.5px solid rgba(255,255,255,0.6)',
  background: 'rgba(0,0,0,0.45)',
  backdropFilter: 'blur(4px)',
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

  const onPrev = () => onSelect((index - 1 + count) % count);
  const onNext = () => onSelect((index + 1) % count);

  const urls = useMemo(() => images.map((item) => item.img), [images]);
  const { direction, dialogRef } = useLightboxNav({
    urls,
    index,
    onPrev,
    onNext,
    onClose,
  });

  const thumbs = useMemo(
    () =>
      images.map((item, i) => ({
        key: i,
        src: item.thumb,
        label: `Show image ${i + 1}`,
      })),
    [images],
  );

  /** Out-of-range guard (noUncheckedIndexedAccess). */
  if (!current) {
    return null;
  }

  return (
    <LightboxOverlay
      dialogRef={dialogRef}
      testId="portfolio-lightbox"
      label={masterName ? `${masterName} — portfolio` : 'Portfolio viewer'}
      style={{ background: 'rgba(8,0,14,0.92)', backdropFilter: 'blur(12px)' }}
      onClose={onClose}
    >
      <LightboxCloseButton onClose={onClose} />
      <LightboxCounter index={index} total={count} />

      <LightboxArrow
        side="prev"
        onClick={onPrev}
        label="Previous"
        className="left-4 transition-colors md:left-8"
        style={ARROW_STYLE}
      />

      {/* Stage */}
      <div className="flex w-full max-w-2xl flex-col items-center gap-4 px-4 md:mx-20 md:px-0">
        <LightboxStage
          src={current.img}
          preview={current.preview}
          alt={current.alt}
          direction={direction}
          onPrev={onPrev}
          onNext={onNext}
        />

        {/* Caption + share — mock: service line (role fallback: the CMS has no
            per-photo service name), then "name · role" with the role in PINK. */}
        <div className="flex w-full items-center justify-between gap-4 px-1">
          <div className="min-w-0">
            <p className="truncate text-lg font-black text-white">
              {role || masterName}
            </p>
            <p
              className="mt-0.5 truncate text-base"
              style={{ color: '#a8a9b5' }}
            >
              {masterName}
              {role ? (
                <span style={{ color: '#ed21f1' }}> · {role}</span>
              ) : null}
            </p>
          </div>
          <button
            className="flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-white/10"
            style={{ border: '1.5px solid rgba(255,255,255,0.14)' }}
            aria-label="Share"
          >
            <Share2 size={14} color="#fff" />
          </button>
        </div>

        <LightboxThumbStrip thumbs={thumbs} index={index} onSelect={onSelect} />
      </div>

      <LightboxArrow
        side="next"
        onClick={onNext}
        label="Next"
        className="right-4 transition-colors md:right-8"
        style={ARROW_STYLE}
      />
    </LightboxOverlay>
  );
};

export default PortfolioLightbox;
