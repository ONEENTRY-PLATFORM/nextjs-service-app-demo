import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';

import CurrencySymbol from '@/components/shared/CurrencySymbol';
import { productCurrency } from '@/components/shared/productCurrency';

/**
 * ProductPrice component displays the price of a product
 * @param   {object}          props         - Component properties
 * @param   {IProductsEntity} props.product - The product entity containing price information
 * @returns {JSX.Element}                   JSX element displaying the product price with its CMS currency
 */
const ProductPrice = ({
  product,
}: {
  product: IProductsEntity;
}): JSX.Element => {
  /** Safely extract the price, providing a default value if it's undefined */
  const price = product?.price ?? 'N/A';

  return (
    <span>
      <CurrencySymbol currency={productCurrency(product)} />
      {price}
    </span>
  );
};

export default ProductPrice;
