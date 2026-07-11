import Link from 'next/link';
import type { Dispatch, JSX, SetStateAction } from 'react';

import CardAnimations from '@/app/animations/CarouselCardAnimations';

import CarouselCardImage from './CarouselCardImage';

/**
 * Gallery carousel card — an image-only tile that links to its service category.
 *
 * Matches the static-html home GALLERY strip: a 4/5 rounded tile with a subtle
 * hover zoom and no text overlay. Clicking anywhere on the tile opens the
 * matching service category page (falling back to the gallery page). Animations
 * and the hover callback (used to pause card motion) are preserved from the
 * original carousel card.
 * @param   {object}                            props                  - Component properties
 * @param   {object}                            props.cardData         - Data object for the card
 * @param   {string}                            props.cardData.name    - Image alt text
 * @param   {string}                            props.cardData.link    - Target service category URL
 * @param   {string}                            props.cardData.img     - Full-size image URL
 * @param   {string}                            props.cardData.thumb   - Thumbnail image URL
 * @param   {string}                            props.cardData.preview - Blur preview data
 * @param   {Dispatch<SetStateAction<boolean>>} props.setState         - Hover state setter for the carousel
 * @param   {number}                            props.index            - Index of the card in the carousel
 * @returns {JSX.Element}                                              JSX.Element representing the carousel card
 */
const GalleryCard = ({
  cardData,
  setState,
  index,
}: {
  cardData: {
    name: string;
    link: string;
    img: string;
    thumb: string;
    preview: string | null;
  };
  setState: Dispatch<SetStateAction<boolean>>;
  index: number;
}): JSX.Element => (
  <div
    className="group relative flex min-w-[16.5vw] flex-col px-1.5 max-xl:min-w-[25vw] max-xs:min-w-[50vw] max-2xl:min-w-[20vw] max-lg:min-w-[25vw] max-md:min-w-[33.3333vw] md:px-2"
    onPointerEnter={() => setState(true)}
    onPointerLeave={() => setState(false)}
  >
    {/** Render animated card wrapper */}
    <CardAnimations
      className="relative flex w-full flex-col"
      index={index}
      setState={setState}
    >
      {/** Image-only tile linking to the matching service category */}
      <Link
        href={cardData.link || '/gallery'}
        className="relative block aspect-4/5 w-full overflow-hidden rounded-2xl bg-slate-100"
      >
        <CarouselCardImage cardData={cardData} />
      </Link>
    </CardAnimations>
  </div>
);

export default GalleryCard;
