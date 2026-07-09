import Link from 'next/link';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

/**
 * BanerPhone component.
 * @param   {object}       props       - The props for the component.
 * @param   {IBlockEntity} props.block - The block data containing attributes for the section.
 * @returns {JSX.Element}              JSX.Element
 */
const BanerPhone = ({ block }: { block: IBlockEntity }): JSX.Element => {
  /** Extract phone and formatted phone values from block attributes */
  const { phone, phone_formatted } = block.attributeValues;

  /** Render banner phone number with link to dial */
  return (
    <Link
      id="baner_phone"
      href={`tel:${(phone?.value as string | undefined) || ''}`}
      className="relative text-4xl font-medium hover:text-white focus:text-white focus:outline-none max-sm:text-xl"
    >
      {phone_formatted?.value as string | undefined}
    </Link>
  );
};

export default BanerPhone;
