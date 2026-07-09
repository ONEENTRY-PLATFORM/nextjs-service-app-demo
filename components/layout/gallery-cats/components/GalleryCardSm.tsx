import Link from 'next/link';
import type { JSX } from 'react';

import CardAnimations from '@/app/animations/CardAnimations';

import CardSmImage from './CardSmImage';
import CardSmInfo from './CardSmInfo';

/**
 * CardSmall component
 * @param   {object}      props                             - Component props
 * @param   {object}      props.cardData                    - Card data
 * @param   {string}      props.cardData.title              - Card title
 * @param   {string}      props.cardData.href               - Card link
 * @param   {object}      props.cardData.thumb              - Card thumbnail
 * @param   {string}      props.cardData.thumb.downloadLink - Card thumbnail download link
 * @param   {string}      props.cardData.preview            - Card preview
 * @param   {number}      props.index                       - Card index
 * @returns {JSX.Element}                                   - CardSmall component
 */
const GalleryCardSm = ({
  cardData,
  index,
}: {
  cardData: {
    title: string;
    href: string;
    thumb: { downloadLink: string };
    preview: string;
  };
  index: number;
}): JSX.Element => {
  const { href } = cardData;
  return (
    <CardAnimations className={''} index={index}>
      <Link
        href={href}
        className="relative mb-1 flex flex-col overflow-hidden hover:text-fuchsia-500"
      >
        <CardSmImage cardData={cardData} />
        <CardSmInfo cardData={cardData} />
      </Link>
    </CardAnimations>
  );
};

export default GalleryCardSm;
