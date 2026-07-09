'use client';

import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';
import { useMemo } from 'react';

import TableRowAnimations from '../animations/TableRowAnimations';
import ProductBadge from './ProductBadge';
import ProductPrice from './ProductPrice';
import ProductTitle from './ProductTitle';

/**
 * ProductRow component for rendering a row in the products table
 * @param   {object}                             props             - Props for the ProductRow component
 * @param   {IProductsEntity}                    props.product     - Product entity object containing detailed product information
 * @param   {string}                             props.color       - Theme color used to set the product price and badge color
 * @param   {number}                             props.index       - Index position of the current row in the table
 * @param   {boolean}                            props.isLast      - Identifies whether this is the last row in the table, used to control border display
 * @param   {(product: IProductsEntity) => void} props.clickHandle - Row click event handler function
 * @returns {JSX.Element}                                          JSX element of the product table row
 */
const ProductRow = ({
  product,
  color,
  index,
  isLast,
  clickHandle,
}: {
  product: IProductsEntity;
  color: string;
  isLast: boolean;
  clickHandle: (product: IProductsEntity) => void;
  index: number;
}): JSX.Element => {
  /**
   * Generate dynamic class names based on row properties
   * Using useMemo to optimize performance by memoizing the result and preventing unnecessary re-computations
   */
  const rowClass = useMemo(() => {
    const baseClass =
      'align-middle max-md:max-w-full max-md:flex-wrap cursor-pointer group ';
    const borderClass = isLast ? '' : 'border-b border-solid ';
    return `${baseClass} ${borderClass}`;
  }, [isLast]);

  /*
   * Animated table row wrapper component that provides entrance animations
   * Handles click events and passes the product data to the callback
   */
  return (
    <TableRowAnimations
      className={rowClass}
      onClick={() => clickHandle(product)}
      index={index}
      style={{ borderColor: color }}
    >
      {/* Services cell - displays the service information for the offer */}
      <td className="w-50 py-1.5 pr-5 align-middle text-lg text-neutral-600 group-hover:text-fuchsia-500">
        <ProductTitle product={product} />
      </td>

      {/* Badge cell - displays promotional badge or special offer indicator if available */}
      <td className="py-1.5 pr-5 align-middle">
        <ProductBadge product={product} color={color} />
      </td>

      {/* Prices cell - displays the product's price information, right-aligned */}
      <td
        className={
          'whitespace-nowrap py-1.5 pl-5 text-right align-middle text-lg font-bold leading-8 text-' +
          color
        }
      >
        <ProductPrice product={product} />
      </td>
    </TableRowAnimations>
  );
};

export default ProductRow;
