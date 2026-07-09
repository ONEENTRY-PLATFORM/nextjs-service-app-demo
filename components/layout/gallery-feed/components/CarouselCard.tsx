import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { Dispatch, JSX, SetStateAction } from 'react';

import CardAnimations from '@/app/animations/CarouselCardAnimations';

import CarouselCardImage from './CarouselCardImage';
import CarouselCardInfo from './CarouselCardInfo';

/**
 * Gallery carousel card component to display a master's work in a carousel format.
 *
 * This component represents a single card in a gallery carousel, showing a master's work
 * with their name, specialization, and a link to their profile. It includes animations
 * and hover interactions to enhance user experience. The card displays an image that
 * can be viewed in a lightbox and provides information about the master and their work.
 * @param   {object}                            props                     - Component properties
 * @param   {IAttributeValues}                  props.dict                - Dictionary object containing localized text values
 * @param   {object}                            props.cardData            - Data object for the card including name, image links and specialization
 * @param   {string}                            props.cardData.name       - Name of the master
 * @param   {string}                            props.cardData.link       - Link to the master's profile page
 * @param   {string}                            props.cardData.img        - Full-size image URL
 * @param   {string}                            props.cardData.thumb      - Thumbnail image URL
 * @param   {string}                            props.cardData.preview    - Preview image data
 * @param   {object}                            props.cardData.spec       - Specialization information with title
 * @param   {string}                            props.cardData.spec.title - Specialization title
 * @param   {Dispatch<SetStateAction<boolean>>} props.setState            - Function to update the hover state of the carousel
 * @param   {number}                            props.index               - Index of the card in the carousel for animation purposes
 * @returns {JSX.Element}                                                 JSX.Element representing the carousel card with image and information
 */
const GalleryCard = ({
  dict,
  cardData,
  setState,
  index,
}: {
  dict: IAttributeValues;
  cardData: {
    name: string;
    link: string;
    img: string;
    thumb: string;
    preview: string | null;
    spec: {
      title: string;
    };
  };
  setState: Dispatch<SetStateAction<boolean>>;
  index: number;
}): JSX.Element => (
  <div
    className="group relative flex h-80 min-w-[16.5vw] flex-col overflow-hidden max-xl:min-w-[25vw] max-xs:min-h-60 max-xs:min-w-[50vw] max-2xl:min-w-[20vw] max-lg:min-w-[25vw] max-md:h-70 max-md:min-h-65 max-md:min-w-[33.3333vw]"
    onPointerEnter={() => setState(true)}
    onPointerLeave={() => setState(false)}
  >
    {/** Render animated card with image and info overlay */}
    <CardAnimations
      className="relative flex w-full flex-col justify-center text-sm text-white"
      index={index}
      setState={setState}
    >
      {/** Display gallery image in carousel card */}
      <figure className="relative flex h-80 w-full flex-col overflow-hidden bg-slate-100 max-md:h-70">
        <CarouselCardImage cardData={cardData} />
      </figure>
      {/** Display gallery card information section */}
      <div className="gallery-card-info absolute bottom-0 left-0 w-full bg-transparent">
        {/** Render carousel card information with dictionary data */}
        <CarouselCardInfo dict={dict} cardData={cardData} />
        {/** Background element for gallery card info section */}
        <div className="gallery-card-info-bg"></div>
      </div>
    </CardAnimations>
  </div>
);

export default GalleryCard;
