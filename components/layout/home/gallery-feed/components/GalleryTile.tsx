import Link from 'next/link';
import type { JSX } from 'react';

import CardAnimations from '@/app/animations/CardAnimations';
import Image from '@/components/shared/Image';

/**
 * A single gallery tile — image plus its Gallery-page (category-filtered) link
 * @property {string}        name      - Gallery category name (the image alt text)
 * @property {string}        link      - Gallery page route filtered to the tile's category
 * @property {string}        thumb     - Tile image URL
 * @property {string | null} [preview] - Ready-made CMS LQIP (`previewLink`); `null` for files uploaded without previews
 */
export type GalleryGridCard = {
  name: string;
  link: string;
  thumb: string;
  preview?: string | null;
};

/**
 * GalleryTile — one tile of the home GALLERY strip: an edge-to-edge `4/5` photo
 * with a subtle hover zoom and magenta tint, opening the Gallery page filtered
 * to its category (static-html mock, `HomePage.tsx` → GALLERY STRIP).
 *
 * The {@link CardAnimations} wrapper gives the tile the same behaviour as the
 * catalog and offer cards: it fades and scales in once it scrolls into view,
 * reverses back out when it leaves, and scales away on page transitions —
 * staggered by `index` so the strip cascades.
 * @param   {object}          props       - Component properties
 * @param   {GalleryGridCard} props.card  - Gallery tile data
 * @param   {number}          props.index - Index in the strip, for staggered animations
 * @returns {JSX.Element}                 Animated gallery tile
 */
const GalleryTile = ({
  card,
  index,
}: {
  card: GalleryGridCard;
  index: number;
}): JSX.Element => (
  <CardAnimations className="w-full" index={index}>
    <Link
      data-testid="gallery-strip-item"
      prefetch={false}
      href={card.link || '/gallery'}
      className="group relative block aspect-4/5 overflow-hidden rounded-2xl bg-slate-100"
    >
      <Image
        src={card.thumb}
        alt={card.name}
        sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
        placeholder={card.preview ? 'blur' : 'empty'}
        {...(card.preview ? { blurDataURL: card.preview } : {})}
        className="absolute inset-0"
        imageClassName="transition-transform duration-500 group-hover:scale-105"
      />
      {/* Magenta hover tint (static-html GALLERY strip) */}
      <span className="pointer-events-none absolute inset-0 bg-[#c800d7]/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </Link>
  </CardAnimations>
);

export default GalleryTile;
