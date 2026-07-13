import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

import { getBlockByMarker } from '@/app/api';
import SectionTitle from '@/components/shared/SectionTitle';

import OffersFeed from './components/OffersFeed';

/**
 * OffersFeedBlock component displays the complete offers section with title and
 * feed. Special offers are the `offer` products curated on the
 * `home_offers_feed` block as similar products, read via `getBlockByMarker`.
 * The whole section is hidden while the CMS holds no `offer` products.
 * @param   {object}                      props         - Component properties
 * @param   {IBlockEntity}                [props.block] - The `home_offers_feed` block
 * @returns {Promise<JSX.Element | null>}               The offers section, or `null` when empty
 */
const OffersFeedBlock = async ({
  block,
}: {
  block?: IBlockEntity | undefined;
}): Promise<JSX.Element | null> => {
  const data = block ? await getBlockByMarker(block.identifier) : null;
  const products = (data?.block?.similarProducts?.items ?? []).filter(
    (product) => product.attributeSetIdentifier === 'offer',
  );

  /** No offers — hide the whole section instead of showing an empty heading. */
  if (products.length < 1) {
    return null;
  }

  /** Section heading; falls back to the mock's "Best Offers" when the block is not filled */
  const title = block?.localizeInfos?.title || 'Best Offers';

  return (
    <section className="flex w-full justify-center bg-white py-10 pb-4">
      <div className="mx-auto mb-6 w-full max-w-7xl flex-col px-3 md:px-8">
        <div className="flex w-full flex-col items-center justify-center">
          <SectionTitle title={title} delay={0.25} className="mb-6 md:mb-10" />
          <OffersFeed products={products} />
        </div>
      </div>
    </section>
  );
};

export default OffersFeedBlock;
