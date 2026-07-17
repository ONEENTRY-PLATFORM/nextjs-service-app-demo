import type { JSX } from 'react';

import type { GalleryGridCard } from './GalleryTile';
import GalleryTile from './GalleryTile';

/**
 * GalleryGrid — the home GALLERY strip as a static, full-width photo grid, as
 * in the static-html mock (`HomePage.tsx` → GALLERY STRIP): six edge-to-edge
 * `4/5` tiles (2 columns on mobile, 3 on tablet, 6 on desktop). Each
 * {@link GalleryTile} carries its own scroll and page-transition animations.
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
        <GalleryTile key={index} card={card} index={index} />
      ))}
    </div>
  );
};

export default GalleryGrid;
