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
 * desktop, with equal-height cards. Offers are the `offer` products curated on
 * the `home_offers_feed` block (its similar products); while none are attached
 * it falls back to the demo offers.
 * @param   {object}               props         - Component properties
 * @param   {IBlockEntity}         [props.block] - The `home_offers_feed` block
 * @returns {Promise<JSX.Element>}               Promise resolving to the animated offers feed
 */
const OffersFeed = async ({
  block,
}: {
  block?: IBlockEntity | undefined;
}): Promise<JSX.Element> => {
  /**
   * Special offers are the `offer` products attached to the `home_offers_feed`
   * block as similar products (curated per the home page), read via
   * `getBlockByMarker` which returns the block with its `similarProducts`.
   */
  const data = block ? await getBlockByMarker(block.identifier) : null;
  const products = (data?.block?.similarProducts?.items ?? []).filter(
    (product) => product.attributeSetIdentifier === 'offer',
  );

  /**
   * Fall back to the mock's demo offers while the CMS holds no `offer`
   * products, so the home page matches the design instead of hiding the
   * section.
   */
  if (products.length < 1) {
    return (
      <OffersAnimations className="grid w-full grid-cols-1 items-stretch gap-6 xl:grid-cols-4 sm:max-xl:grid-cols-2 lg:gap-8">
        {(homeOffersData as DemoOffer[]).map((offer, index) => (
          <DemoOfferCard key={offer.id} offer={offer} index={index} />
        ))}
      </OffersAnimations>
    );
  }

  /** Render offers grid with animation wrapper */
  return (
    <OffersAnimations className="grid w-full grid-cols-1 items-stretch gap-6 xl:grid-cols-4 sm:max-xl:grid-cols-2 lg:gap-8">
      {products.map((product, index) => (
        <OfferCard key={product.id} product={product} index={index} />
      ))}
    </OffersAnimations>
  );
};

export default OffersFeed;
