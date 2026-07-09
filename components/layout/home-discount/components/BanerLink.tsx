import Link from 'next/link';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

/**
 * BanerLink component.
 * @param   {object}       props       - The props for the component.
 * @param   {IBlockEntity} props.block - The block data containing attributes for the section.
 * @returns {JSX.Element}              JSX.Element
 */
const BanerLink = ({ block }: { block: IBlockEntity }): JSX.Element => {
  /** Extract button link and text values from block attributes */
  const { button_link, button_text } = block.attributeValues;

  /** Render banner call-to-action button with link */
  return (
    <Link
      href={(button_link?.value as string | undefined) || '#'}
      id="baner_link"
      className="relative mb-6 self-center rounded-[40px] bg-white px-20 py-4 text-center text-2xl font-bold text-fuchsia-500 uppercase transition-colors duration-300 hover:bg-gray-100 hover:text-fuchsia-450 hover:shadow-lg focus:bg-gray-100 focus:outline-none max-sm:px-6 max-sm:text-sm"
    >
      {button_text?.value as string | undefined}
    </Link>
  );
};

export default BanerLink;
