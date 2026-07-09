import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

import { getBlockByMarker } from '@/app/api';
import { gradients } from '@/components/data';

import OffersAnimations from '../animations/OffersAnimations';
import OfferCard from './OfferCard';

/**
 * OffersFeed component displays a feed of special offers with animations
 * @param   {object}               props       - Component properties
 * @param   {IAttributeValues}     props.dict  - Dictionary containing localized texts
 * @param   {IBlockEntity}         props.block - Block entity containing offer data and metadata
 * @returns {Promise<JSX.Element>}             Promise resolving to a JSX element with animated offers feed
 */
const OffersFeed = async ({
  dict,
  block,
}: {
  dict: IAttributeValues;
  block: IBlockEntity;
}): Promise<JSX.Element> => {
  /** Fetch block data by identifier */
  const data = await getBlockByMarker(block.identifier);
  /** Return empty fragment if no block data found */
  if (!data.block) {
    return <></>;
  }

  /** Process offers data to extract relevant information */
  const offersData = data.block.similarProducts?.items.map((offer, i) => {
    /** Calculate discount percentage based on sale price and actual price */
    const salePrice =
      (offer.attributeValues.sale?.value as number | undefined) || 0;
    const priceOff = ((salePrice - (offer?.price || 0)) / salePrice) * 100;
    /** Determine if party star icon should be displayed */
    const offerTypeArr = offer.attributeValues.offer_type?.value as
      Array<{ value: string }> | undefined;
    const icon = offerTypeArr?.[0]?.value === 'party_star';

    /** Map offer data to required structure for OfferCard component */
    const servicesArr = offer.attributeValues.services?.value as
      Array<{ title: string }> | undefined;
    return {
      title1: servicesArr?.[0]?.title || '',
      title2: servicesArr?.[1]?.title || '',
      backgroundImage: gradients[i] || '',
      priceOff: Math.round(priceOff),
      icon,
      product: offer,
    };
  });

  /** Render offers feed with animation wrapper */
  return (
    <div className="flex w-full items-center justify-center">
      <OffersAnimations className="mx-auto flex w-full max-w-265 flex-row flex-nowrap justify-between gap-4 overflow-x-auto overflow-y-hidden max-xl:gap-14 max-md:gap-8">
        {offersData?.map((item, index) => (
          <OfferCard
            key={index}
            index={index as number}
            item={item}
            dict={dict}
          />
        ))}
      </OffersAnimations>
    </div>
  );
};

export default OffersFeed;
