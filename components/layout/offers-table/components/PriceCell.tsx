import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';

import Dirham from '@/components/shared/Dirham';

/**
 * PriceDisplay component shows the price information for a product with sale price
 * @param   {object}          props         - Component properties
 * @param   {IProductsEntity} props.product - Product entity containing price and sale information
 * @param   {string}          props.color   - Color for the main price display
 * @returns {JSX.Element}                   JSX element displaying product prices
 */
const PriceDisplay = ({
  product,
  color,
}: {
  product: IProductsEntity;
  color: string;
}): JSX.Element => {
  /** Extract current price and sale price from product */
  const price = product.price;
  const sale = product.attributeValues?.sale?.value as number | undefined;

  return (
    <div className="float-right flex w-auto flex-row gap-3 self-stretch text-right text-lg">
      {/* Display sale price in gray */}
      <div className="whitespace-nowrap text-gray-400">
        <Dirham />
        {sale}
      </div>
      {/* Display current price in specified color */}
      <div className={'font-bold whitespace-nowrap'} style={{ color: color }}>
        <Dirham />
        {price}
      </div>
    </div>
  );
};

export default PriceDisplay;
