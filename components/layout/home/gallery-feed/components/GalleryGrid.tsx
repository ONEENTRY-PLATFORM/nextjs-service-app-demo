import Image from 'next/image';
import Link from 'next/link';
import type { JSX } from 'react';

/** A single gallery tile — image plus its target service-category link */
export type GalleryGridCard = {
  name: string;
  link: string;
  thumb: string;
};

/**
 * GalleryGrid — the home GALLERY strip as a static, full-width photo grid, as
 * in the static-html mock (`HomePage.tsx` → GALLERY STRIP): six edge-to-edge
 * `4/5` tiles (2 columns on mobile, 3 on tablet, 6 on desktop) with a subtle
 * hover zoom. Each tile links to its matching service category.
 * @param   {object}            props       - Component properties
 * @param   {GalleryGridCard[]} props.cards - Gallery tiles (already trimmed to the strip length)
 * @returns {JSX.Element}                   Gallery grid
 */
const GalleryGrid = ({ cards }: { cards: GalleryGridCard[] }): JSX.Element => {
  return (
    <div
      data-testid="gallery-strip"
      className="mt-4 grid grid-cols-2 gap-3 px-3 sm:grid-cols-3 md:mt-10 md:gap-4 md:px-6 lg:grid-cols-6"
    >
      {cards.map((card, index) => (
        <Link
          key={index}
          data-testid="gallery-strip-item"
          prefetch={false}
          href={card.link || '/gallery'}
          className="group relative block aspect-4/5 overflow-hidden rounded-2xl bg-slate-100"
        >
          {card.thumb && (
            <Image
              src={card.thumb}
              alt={card.name}
              fill
              sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          {/* Magenta hover tint (static-html GALLERY strip) */}
          <span className="pointer-events-none absolute inset-0 bg-[#c800d7]/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </Link>
      ))}
    </div>
  );
};

export default GalleryGrid;
