import parse from 'html-react-parser';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';

import BadgeIcon from '@/components/icons/badge';

/**
 * OfferBadge component displays a badge with product type information
 *
 * This component renders a visual badge that shows the product type, consisting of an icon
 * and a circular badge with text. The badge is conditionally rendered only when product
 * type information is available.
 * @param   {object}          props         - Component properties
 * @param   {IProductsEntity} props.product - Product entity object containing all product data,
 *                                          including attribute values where the badge information is stored
 * @param   {string}          props.color   - Background color for the badge, can be a hex color code
 *                                          (e.g., "#FF0000") or a color name (e.g., "red"), which will be applied
 *                                          to both the badge icon and the circular text container
 * @returns {JSX.Element}                   Returns a JSX element containing:
 *                                          - A BadgeIcon component with the specified color
 *                                          - A circular container with the product type title in white text
 *                                          - An empty fragment (<></>) if no badge data is available
 */
const OfferBadge = ({
  product: { attributeValues },
  color,
}: {
  product: IProductsEntity;
  color: string;
}): JSX.Element => {
  /** Extract the badge title from the product's attribute values */
  const typeArr = attributeValues?.type?.value as
    Array<{ title: string }> | undefined;
  const badge = typeArr?.[0]?.title;

  /** Early return with empty fragment if no badge title is found */
  if (!badge) {
    return <></>;
  }

  return (
    /** Main container div that aligns the badge icon and text horizontally */
    <div className="flex flex-row items-center">
      {/* Badge icon displayed before the text badge */}
      <BadgeIcon color={color} />

      {/* Circular badge container for the product type text */}
      <div
        className={
          'size-11 justify-center self-center rounded-full px-1 py-2.5 text-center text-xs leading-3 font-medium text-white '
        }
        style={{ backgroundColor: color }}
      >
        {/* Conditionally render the badge text only if badge exists */}
        {badge && parse(badge)}
      </div>
    </div>
  );
};

export default OfferBadge;
