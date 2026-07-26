import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';

import OffersAnimations from '../animations/OffersAnimations';
import OfferCard from './OfferCard';

/**
 * OffersFeed component displays the special offers grid, as in the:
 * 1 column on mobile, 2 on tablet and 4 on
 * desktop, with equal-height cards. It renders the `offer` products passed by
 * the parent block, which already hides the section when there are none.
 * @param   {object}            props          - Component properties
 * @param   {IProductsEntity[]} props.products - The `offer` products to render
 * @returns {JSX.Element}                      The animated offers feed
 */
const OffersFeed = ({
  products,
}: {
  products: IProductsEntity[];
}): JSX.Element => (
  <OffersAnimations className="grid w-full grid-cols-1 items-stretch gap-6 xl:grid-cols-4 sm:max-xl:grid-cols-2 lg:gap-8">
    {products.map((product, index) => (
      <OfferCard key={product.id} product={product} index={index} />
    ))}
  </OffersAnimations>
);

export default OffersFeed;
