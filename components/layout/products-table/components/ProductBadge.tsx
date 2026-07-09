import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';

/**
 * ProductBadge functional component displays a badge with product type information
 * @param   {object}          props         - Component properties
 * @param   {IProductsEntity} props.product - Product entity containing attribute values
 * @param   {string}          props.color   - Background color class for the badge
 * @returns {JSX.Element}                   JSX element representing the product badge
 */
const ProductBadge = ({
  product: { attributeValues },
  color,
}: {
  product: IProductsEntity;
  color: string;
}): JSX.Element => {
  /** Safely extract the badge title from the product's attribute values */
  const typeArr = attributeValues?.type?.value as
    Array<{ title: string }> | undefined;
  const badgeTitle = typeArr?.[0]?.title ?? '';

  /** Return empty div if no badge title is available */
  if (!badgeTitle) {
    return (
      <div className={'size-10 self-center leading-3 font-medium text-white'} />
    );
  }

  /** Render badge with extracted title and specified color */
  return (
    <div
      className={
        'size-11 justify-center self-center rounded-full text-center text-xs font-medium leading-3 px-1 py-2.5 text-white bg-' +
        color
      }
    >
      {badgeTitle}
    </div>
  );
};

export default ProductBadge;
