import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

import { getBlockByMarker } from '@/app/api';

import OffersAnimations from '../animations/OffersAnimations';
import OfferCard from './OfferCard';

/**
 * OffersFeed component displays the special offers grid, as in the
 * static-html mock (BEST OFFERS): 1 column on mobile, 2 on tablet and 4 on
 * desktop, with equal-height cards.
 * @param   {object}               props       - Component properties
 * @param   {IBlockEntity}         props.block - Block entity containing offer data and metadata
 * @returns {Promise<JSX.Element>}             Promise resolving to a JSX element with animated offers feed
 */
const OffersFeed = async ({
  block,
}: {
  block: IBlockEntity;
}): Promise<JSX.Element> => {
  /** Fetch block data by identifier */
  const data = await getBlockByMarker(block.identifier);
  /** Return empty fragment if no block data found */
  if (!data.block) {
    return <></>;
  }

  /** Special offers attached to the block */
  const products = data.block.similarProducts?.items ?? [];
  if (products.length < 1) {
    return <></>;
  }

  /** Render offers grid with animation wrapper */
  return (
    <OffersAnimations className="grid w-full grid-cols-1 items-stretch gap-6 xl:grid-cols-4 sm:grid-cols-2 lg:gap-8">
      {products.map((product, index) => (
        <OfferCard key={product.id} product={product} index={index} />
      ))}
    </OffersAnimations>
  );
};

export default OffersFeed;
