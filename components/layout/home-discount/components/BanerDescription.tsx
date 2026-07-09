import parse from 'html-react-parser';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

/**
 * Baner description component.
 * @param   {object}       props       - The props for the component.
 * @param   {IBlockEntity} props.block - The block entity.
 * @returns {JSX.Element}              JSX.Element
 */
const BanerDescription = ({ block }: { block: IBlockEntity }): JSX.Element => {
  /** Extract description attribute from block */
  const { description } = block.attributeValues;
  const descrArr = description?.value as
    Array<{ htmlValue?: string }> | undefined;
  /** Get HTML value of description or fallback to empty string */
  const descrHtml = descrArr?.[0]?.htmlValue ?? '';

  /** Render banner description with parsed HTML content */
  return (
    <div id="baner_descr" className="relative mb-5 underline lg:text-xl">
      {descrHtml && parse(descrHtml)}
    </div>
  );
};

export default BanerDescription;
