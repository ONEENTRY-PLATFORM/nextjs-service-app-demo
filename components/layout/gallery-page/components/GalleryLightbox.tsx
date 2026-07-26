'use client';

import { Share2 } from 'lucide-react';
import type { JSX } from 'react';
import { useMemo } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import LightboxArrow from '@/components/shared/lightbox/LightboxArrow';
import LightboxCloseButton from '@/components/shared/lightbox/LightboxCloseButton';
import LightboxCounter from '@/components/shared/lightbox/LightboxCounter';
import LightboxOverlay from '@/components/shared/lightbox/LightboxOverlay';
import LightboxThumbStrip from '@/components/shared/lightbox/LightboxThumbStrip';
import { useLightboxNav } from '@/components/shared/lightbox/useLightboxNav';
import LightboxStage from '@/components/shared/LightboxStage';
import { dictText } from '@/components/utils/dictText';

import type { GalleryItem } from '../taxonomy';

/** Ring + backdrop styling of the paging arrows. */
const ARROW_STYLE = {
  border: '1.5px solid rgba(255,255,255,0.6)',
  background: 'rgba(0,0,0,0.45)',
};

/**
 * GalleryLightbox — fullscreen photo viewer: blurred dark backdrop, close button,
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
  const dict = useDict();
  const item = items[index];

  const urls = useMemo(() => items.map((photo) => photo.url), [items]);
  const { direction, dialogRef, contentRef, requestClose } = useLightboxNav({
    urls,
    index,
    onPrev,
    onNext,
    onClose,
  });

  const photoWord = dictText(dict, 'photo_word', 'Photo');
  const thumbs = useMemo(
    () =>
      items.map((photo, i) => ({
        key: photo.id,
        src: photo.url,
        label: `${photoWord} ${i + 1}`,
      })),
    [items, photoWord],
  );

  if (!item) {
    return <></>;
  }

  return (
    <LightboxOverlay
      dialogRef={dialogRef}
      testId="gallery-lightbox"
      label={
        item.title
          ? `${dictText(dict, 'photo_word', 'Photo')}: ${item.title}`
          : 'Photo viewer'
      }
      className="backdrop-blur-2xl"
      style={{ background: 'rgba(6,0,14,0.94)' }}
      onClose={requestClose}
    >
      <LightboxCloseButton onClose={requestClose} />
      <LightboxCounter index={index} total={items.length} />

      <LightboxArrow
        side="prev"
        onClick={onPrev}
        label={dictText(dict, 'previous_photo_aria', 'Previous photo')}
        className="left-4 backdrop-blur-xs transition-transform hover:scale-110 active:scale-95 md:left-8"
        style={ARROW_STYLE}
      />

      {/* Main image + caption + thumbnails */}
      <div
        ref={contentRef}
        className="flex w-full max-w-2xl flex-col items-center gap-4 px-4 md:mx-20 md:px-0"
      >
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
              aria-label={dictText(dict, 'share_aria', 'Share')}
              className="flex size-9 items-center justify-center rounded-xl transition-colors hover:bg-white/10"
              style={{ border: '1.5px solid rgba(255,255,255,0.14)' }}
            >
              <Share2 size={14} color="#fff" />
            </button>
          </div>
        </div>

        <LightboxThumbStrip thumbs={thumbs} index={index} onSelect={onSelect} />
      </div>

      <LightboxArrow
        side="next"
        onClick={onNext}
        label={dictText(dict, 'next_photo_aria', 'Next photo')}
        className="right-4 backdrop-blur-xs transition-transform hover:scale-110 active:scale-95 md:right-8"
        style={ARROW_STYLE}
      />
    </LightboxOverlay>
  );
};

export default GalleryLightbox;
