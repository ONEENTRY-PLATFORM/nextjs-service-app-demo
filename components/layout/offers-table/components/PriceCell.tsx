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
  /**
   * `offer_sale` = current price, `offer_price` = crossed-out original
   * (both are `real` attributes whose value comes back as a string).
   */
  const price =
    Number(product.attributeValues?.offer_sale?.value) || product.price;
  const original =
    Number(product.attributeValues?.offer_price?.value) || undefined;

  return (
    <div className="float-right flex w-auto flex-row gap-3 self-stretch text-right text-lg">
      {/* Display crossed-out original price in gray */}
      {original ? (
        <div className="whitespace-nowrap text-gray-400 line-through">
          <Dirham />
          {original}
        </div>
      ) : null}
      {/* Display current price in specified color */}
      <div className={'font-bold whitespace-nowrap'} style={{ color: color }}>
        <Dirham />
        {price}
      </div>
    </div>
  );
};

export default PriceDisplay;
