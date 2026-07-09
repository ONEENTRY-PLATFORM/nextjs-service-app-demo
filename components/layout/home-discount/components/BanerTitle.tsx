import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

/**
 * BanerTitle component.
 * @param   {object}       props       - The props for the component.
 * @param   {IBlockEntity} props.block - The block data containing attributes for the section.
 * @returns {JSX.Element}              JSX.Element
 */
const BanerTitle = ({ block }: { block: IBlockEntity }): JSX.Element => {
  /** Extract title attribute from block values */
  const { title } = block.attributeValues;
  /** Split title by % symbol to create prefix and suffix parts */
  const [titlePrefix, ...titleSuffix] = (
    title?.value as string | undefined
  )?.split('%') || ['', ''];

  /** Render banner title with styled prefix and suffix */
  return (
    <h2
      id="baner_title"
      className="relative mb-8 text-center text-4xl leading-[auto] tracking-wider text-white max-md:mb-4 max-md:max-w-full max-sm:text-2xl"
    >
      <span className="font-black">{titlePrefix} %</span>{' '}
      {titleSuffix.join('%')}
    </h2>
  );
};

export default BanerTitle;
