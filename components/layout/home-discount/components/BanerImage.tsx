import Image from 'next/image';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

/**
 * BanerImage component.
 * @param   {object}       props       - The props for the component.
 * @param   {IBlockEntity} props.block - The block data containing attributes for the section.
 * @returns {JSX.Element}              JSX.Element
 */
const BanerImage = ({ block }: { block: IBlockEntity }): JSX.Element => {
  /** Extract background image attribute from block */
  const { bg_image } = block.attributeValues;
  const bgArr = bg_image?.value as Array<{ downloadLink?: string }> | undefined;
  /** Get download link for background image or fallback to empty string */
  const bgImageUrl = bgArr?.[0]?.downloadLink ?? '';

  /** Render banner background image if URL is available */
  return bgImageUrl ? (
    <Image
      fill
      loading="lazy"
      src={bgImageUrl}
      sizes="(min-width: 600px) 50vw, 100vw"
      className="absolute inset-0 size-full object-cover"
      alt="..."
      id="baner_image"
    />
  ) : (
    <></>
  );
};

export default BanerImage;
