import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';

/**
 * ProductTitle component displays the title of a product
 * @param   {object}          props         - The component props
 * @param   {IProductsEntity} props.product - The product entity containing localization information
 * @returns {JSX.Element}                   JSX element displaying the product title or fallback text
 */
const ProductTitle = ({
  product,
}: {
  product: IProductsEntity;
}): JSX.Element => {
  /** Safely access the title with a fallback in case it's undefined */
  const title = product.localizeInfos?.title ?? 'Untitled Product';

  return <span>{title}</span>;
};

export default ProductTitle;
