import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import GalleryCardAnimations from '@/app/animations/GalleryCardAnimations';

import CardInfo from './CardInfo';
import GalleryCardImage from './GalleryCardImage';

/**
 * GalleryCard component representing a single item in the gallery grid.
 *
 * This component displays a gallery card with an image and information section.
 * It includes animations for enhanced user experience and links to a master's
 * profile with specific service information. The card shows a master's work
 * along with their name and specialization.
 * @param   {object}           props                  - Component properties
 * @param   {IAttributeValues} props.dict             - Dictionary object containing localized text values
 * @param   {object}           props.cardData         - Data object for the card including name, image links and specialization
 * @param   {string}           props.cardData.name    - Name of the master
 * @param   {string}           props.cardData.link    - Link to the master's profile page
 * @param   {string}           props.cardData.img     - Full-size image URL
 * @param   {string}           props.cardData.thumb   - Thumbnail image URL
 * @param   {string}           props.cardData.preview - Low-quality image preview URL
 * @param   {object}           [props.cardData.spec]  - Specialization information with title
 * @param   {number}           props.index            - Index of the card in the gallery grid (used for staggered animations)
 * @returns {JSX.Element}                             JSX.Element representing the GalleryCard with image and information
 */
const GalleryCard = ({
  dict,
  cardData,
  index,
}: {
  dict: IAttributeValues;
  cardData: {
    name: string;
    link: string;
    img: string;
    thumb: string;
    preview: string | null;
    spec?:
      | {
          id?: number | undefined;
          title?: string | undefined;
        }
      | undefined;
  };
  index: number;
}): JSX.Element => (
  <GalleryCardAnimations
    className="group relative flex min-h-80 cursor-pointer flex-col overflow-hidden max-xs:min-h-60 max-xs:min-w-[50vw] max-md:min-h-65"
    index={index}
  >
    <div className="group relative flex w-full flex-col justify-center text-sm text-white">
      <figure className="relative flex min-h-80 w-full flex-col overflow-hidden bg-slate-100">
        <GalleryCardImage cardData={cardData} />
      </figure>
      <div className="gallery-card-info absolute bottom-0 left-0 w-full bg-transparent">
        <CardInfo dict={dict} cardData={cardData} />
        <div className="gallery-card-info-bg"></div>
      </div>
    </div>
  </GalleryCardAnimations>
);

export default GalleryCard;
