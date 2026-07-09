import Image from 'next/image';
import type { JSX } from 'react';

/**
 * CardSmImage component displays a small image card with preview functionality
 * @param   {object}             props                             - Component properties
 * @param   {object}             props.cardData                    - Data for the card including title, thumbnail links and preview
 * @param   {string}             props.cardData.title              - Title of the card, used for alt text
 * @param   {object}             props.cardData.thumb              - Thumbnail object containing download and preview links
 * @param   {string | undefined} props.cardData.thumb.downloadLink - Optional download link for the image
 * @param   {string | undefined} props.cardData.thumb.previewLink  - Optional preview link for the image
 * @param   {string}             props.cardData.preview            - Preview data for blur placeholder
 * @returns {JSX.Element}                                          JSX element representing the image card
 */
const CardSmImage = ({
  cardData: {
    title,
    thumb: { downloadLink, previewLink },
    preview,
  },
}: {
  cardData: {
    title: string;
    thumb: { downloadLink?: string; previewLink?: string };
    preview: string;
  };
}): JSX.Element => {
  return (
    <figure className="relative h-70 shrink-0 bg-slate-100">
      {(downloadLink || previewLink) && (
        <Image
          width={320}
          height={480}
          loading="lazy"
          src={(previewLink as string) || (downloadLink as string)}
          alt={title}
          placeholder="blur"
          blurDataURL={preview}
          className="size-full h-80 self-center object-cover transition-transform duration-500 group-hover:scale-125"
        />
      )}
    </figure>
  );
};

export default CardSmImage;
