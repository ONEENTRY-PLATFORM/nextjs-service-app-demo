import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

import { getBlockByMarker } from '@/app/api';
import { homeOffersData } from '@/components/data';

import OffersAnimations from '../animations/OffersAnimations';
import type { DemoOffer } from './DemoOfferCard';
import DemoOfferCard from './DemoOfferCard';
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
  block?: IBlockEntity | undefined;
}): Promise<JSX.Element> => {
  /** Special offers attached to the block (empty until stage-3 products exist) */
  const data = block ? await getBlockByMarker(block.identifier) : null;
  const products = data?.block?.similarProducts?.items ?? [];

  /**
   * Fall back to the mock's demo offers while the CMS holds no `offer`
   * products, so the home page matches the design instead of hiding the
   * section (content plan, stage 3).
   */
  if (products.length < 1) {
    return (
      <OffersAnimations className="grid w-full grid-cols-1 items-stretch gap-6 sm:max-xl:grid-cols-2 xl:grid-cols-4 lg:gap-8">
        {(homeOffersData as DemoOffer[]).map((offer, index) => (
          <DemoOfferCard key={offer.id} offer={offer} index={index} />
        ))}
      </OffersAnimations>
    );
  }

  /** Render offers grid with animation wrapper */
  return (
    <OffersAnimations className="grid w-full grid-cols-1 items-stretch gap-6 sm:max-xl:grid-cols-2 xl:grid-cols-4 lg:gap-8">
      {products.map((product, index) => (
        <OfferCard key={product.id} product={product} index={index} />
      ))}
    </OffersAnimations>
  );
};

export default OffersFeed;
