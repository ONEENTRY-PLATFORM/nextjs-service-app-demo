'use client';

import { ArrowRight, Plus, X } from 'lucide-react';
import type { JSX } from 'react';
import { useRef } from 'react';

import { useDict } from '@/app/store/providers/useDict';

/** Maximum number of photos attachable to a review (static-html mock) */
const MAX_PHOTOS = 5;

/**
 * PhotoRow — the review photo strip from the static-html `ReviewModal`:
 * up to 5 photo thumbnails (64px, rounded, hover-revealed pink remove badge)
 * followed by a dashed PINK add button (`Plus` when empty, `ArrowRight` after
 * the first photo) that opens the hidden file input.
 * @param   {object}                   props          - Component properties
 * @param   {string[]}                 props.photos   - Attached photo object URLs
 * @param   {(next: string[]) => void} props.onChange - Handler receiving the updated photo list
 * @returns {JSX.Element}                             JSX.Element representing the photo row
 */
const PhotoRow = ({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (next: string[]) => void;
}): JSX.Element => {
  const dict = useDict();
  /** Hidden file input opened by the add button */
  const fileRef = useRef<HTMLInputElement | null>(null);

  /**
   * Append the selected files as object URLs, capped at {@link MAX_PHOTOS}
   * @param   {FileList | null} files - Files picked in the hidden input
   * @returns {void}
   */
  const handleFiles = (files: FileList | null) => {
    if (!files) {
      return;
    }
    const next: string[] = [];
    for (
      let i = 0;
      i < files.length && photos.length + next.length < MAX_PHOTOS;
      i++
    ) {
      const file = files[i];
      if (file) {
        next.push(URL.createObjectURL(file));
      }
    }
    onChange([...photos, ...next]);
  };

  /**
   * Remove one photo and release its object URL
   * @param   {number} idx - Index of the photo to remove
   * @returns {void}
   */
  const removePhoto = (idx: number) => {
    const url = photos[idx];
    if (url) {
      URL.revokeObjectURL(url);
    }
    onChange(photos.filter((_, i) => i !== idx));
  };

  return (
    <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
      {photos.map((src, idx) => (
        <div key={idx} className="group relative size-16 shrink-0">
          {/* Object URLs from the file input can't go through next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="size-full rounded-xl border-[1.5px] border-slate-150 object-cover"
          />
          <button
            onClick={() => removePhoto(idx)}
            className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border-[1.5px] border-fuchsia-500 bg-white text-fuchsia-500 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label={
              (dict?.remove_photo_aria?.value as string | undefined) ||
              'Remove photo'
            }
          >
            <X size={16} />
          </button>
        </div>
      ))}
      {photos.length < MAX_PHOTOS && (
        <button
          onClick={() => fileRef.current?.click()}
          className="flex size-16 shrink-0 items-center justify-center rounded-xl border-[1.5px] border-dashed border-fuchsia-500 bg-fuchsia-500/7 text-fuchsia-500 transition-colors"
          aria-label={
            (dict?.add_photo_aria?.value as string | undefined) || 'Add photo'
          }
        >
          {photos.length === 0 ? <Plus size={22} /> : <ArrowRight size={20} />}
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
};

export default PhotoRow;
