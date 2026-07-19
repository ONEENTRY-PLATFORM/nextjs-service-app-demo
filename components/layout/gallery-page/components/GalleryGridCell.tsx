'use client';

import { ArrowUpRight, Heart } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';

import Image from '@/components/shared/Image';

import type { GalleryItem } from '../taxonomy';

/**
 * GalleryGridCell — a single photo cell of the gallery grid, ported from the
 * static-html mock (`GalleryPage.tsx` → `GridCell`): 4/5 photo with a
 * zoom-on-hover, a purple gradient hover overlay with the master name, role
 * and a "Check a profile" link, plus a like heart.
 *
 * The profile link opens the linked master's profile (`/masters/{id}`) when
 * the photo carries a CMS `master_id`, degrading to the specialists list.
 * @param   {object}               props        - Component properties
 * @param   {GalleryItem}          props.item   - Gallery photo item
 * @param   {boolean}              props.liked  - Whether the photo is liked
 * @param   {(id: string) => void} props.onLike - Toggle like for the photo id
 * @param   {() => void}           props.onOpen - Open the photo in the lightbox
 * @returns {JSX.Element}                       Gallery grid cell
 */
const GalleryGridCell = ({
  item,
  liked,
  onLike,
  onOpen,
}: {
  item: GalleryItem;
  liked: boolean;
  onLike: (id: string) => void;
  onOpen: () => void;
}): JSX.Element => {
  return (
    <div
      data-testid="gallery-item"
      data-gallery-id={item.id}
      role="button"
      tabIndex={0}
      aria-label={`Open photo: ${item.title}`}
      className="group relative aspect-4/5 cursor-pointer overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-pink"
      onClick={onOpen}
      onKeyDown={(e) => {
        // Make the lightbox trigger operable for keyboard users (WCAG 2.1.1):
        // Enter/Space activate it just like the pointer `onClick`.
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      {/* Photo — LQIP blur placeholder (CMS `previewLink` or generated) fades
          out on load */}
      <Image
        src={item.url}
        alt={item.title}
        loading="lazy"
        sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
        placeholder={item.preview ? 'blur' : 'empty'}
        {...(item.preview ? { blurDataURL: item.preview } : {})}
        className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Hover overlay — full cell gradient */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(160deg, rgba(200,0,215,0.88) 0%, rgba(90,0,180,0.92) 100%)',
        }}
      >
        {/* Master info */}
        <div className="flex flex-col gap-0.5">
          <p
            className="leading-tight font-black text-white"
            style={{ fontSize: 'clamp(1rem,1.6vw,1.25rem)' }}
          >
            {item.master}
          </p>
          <p className="text-base font-medium text-white/75">{item.role}</p>

          {/* "Check a profile" link → the master's profile (list fallback) */}
          <Link
            href={item.masterId ? `/masters/${item.masterId}` : '/masters'}
            onClick={(e) => e.stopPropagation()}
            className="mt-2 flex w-fit items-center gap-1 text-base font-semibold text-white underline decoration-white/50 underline-offset-2 transition-all hover:decoration-white"
          >
            Check a profile <ArrowUpRight size={18} />
          </Link>
        </div>

        {/* Like heart — top right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(item.id);
          }}
          aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full backdrop-blur-sm transition-all active:scale-90"
          style={{
            background: liked ? '#ed21f1' : 'rgba(255,255,255,0.20)',
            boxShadow: liked ? '0 0 14px #ed21f188' : 'none',
          }}
        >
          <Heart size={14} fill={liked ? '#fff' : 'none'} color="#fff" />
        </button>
      </div>

      {/* Liked badge (visible when liked, on non-hover state) */}
      {liked && (
        <div
          className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-full bg-accent-pink transition-opacity group-hover:opacity-0"
          style={{ boxShadow: '0 0 12px #ed21f199' }}
        >
          <Heart size={17} fill="#fff" color="#fff" />
        </div>
      )}
    </div>
  );
};

export default GalleryGridCell;
