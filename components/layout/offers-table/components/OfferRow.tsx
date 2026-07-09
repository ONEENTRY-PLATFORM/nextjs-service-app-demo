/* eslint-disable jsdoc/reject-function-type */
'use client';

import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';
import { useMemo } from 'react';

import TableRowAnimations from '../../products-table/animations/TableRowAnimations';
import OfferBadge from './OfferBadge';
import PriceDisplay from './PriceCell';
import ServicesCell from './ServicesCell';

/**
 * OfferRow component displays a single row in the offers table with service, badge, and price information
 *
 * This component renders a table row that shows an offer's details including services, badge (if applicable),
 * and pricing information. It includes interactive elements and animations for enhanced user experience.
 * @param   {object}          props             - Component properties
 * @param   {IProductsEntity} props.product     - Product entity containing all offer details and metadata
 * @param   {Function}        props.handleClick - Callback function executed when the row is clicked
 * @param   {boolean}         props.isLast      - Flag indicating whether this is the last row in the table (used for border styling)
 * @param   {string}          props.color       - Color value used for styling various elements within the row
 * @param   {number}          props.index       - Index of the row in the table, used for staggered animation effects
 * @returns {JSX.Element}                       - JSX element representing a complete table row with offer information
 */
const OfferRow = ({
  product,
  handleClick,
  isLast,
  color,
  index,
}: {
  product: IProductsEntity;
  handleClick: (product: IProductsEntity) => void;
  isLast: boolean;
  color: string;
  index: number;
}): JSX.Element => {
  /**
   * Generate dynamic class names based on row properties
   * Using useMemo to optimize performance by memoizing the result and preventing unnecessary re-computations
   */
  const cn = useMemo(() => {
    const baseClass =
      'align-middle max-md:max-w-full max-md:flex-wrap cursor-pointer group ';
    const borderClass = isLast ? '' : 'border-b border-solid';
    const highlightClass = '';
    return `${baseClass} ${borderClass}${highlightClass}`;
  }, [isLast]);

  return (
    /*
     * Animated table row wrapper component that provides entrance animations
     * Handles click events and passes the product data to the callback
     */
    <TableRowAnimations
      className={cn}
      onClick={() => handleClick(product)}
      index={index}
      style={{ borderColor: color }}
    >
      {/** Services cell - displays the service information for the offer */}
      <td className="w-50 py-1.5 pr-5 align-middle">
        <ServicesCell product={product} color={color} />
      </td>

      {/** Badge cell - displays promotional badge or special offer indicator if available */}
      <td className="py-1.5 pr-5 align-middle">
        <OfferBadge product={product} color={color} />
      </td>

      {/** Prices cell - displays the product's price information, right-aligned */}
      <td className="py-1.5 pl-5 text-right align-middle">
        <PriceDisplay product={product} color={color} />
      </td>
    </TableRowAnimations>
  );
};

export default OfferRow;
