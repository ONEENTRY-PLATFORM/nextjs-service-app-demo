import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { isOfferProduct } from '@/components/utils/isOfferProduct';
import SectionTitle from '@/components/shared/SectionTitle';

import OffersFeed from './components/OffersFeed';

/**
 * OffersFeedBlock component displays the complete offers section with title and
 * feed. Special offers are the `offer` products curated on the
 * `home_offers_feed` block as similar products, which the page's block list
 * already carries — so they are read straight off the prop rather than refetched.
 * The whole section is hidden while the CMS holds no `offer` products.
 * @param   {object}             props         - Component properties
 * @param   {IBlockEntity}       [props.block] - The `home_offers_feed` block
 * @returns {JSX.Element | null}               The offers section, or `null` when empty
 */
const OffersFeedBlock = ({
  block,
}: {
  block?: IBlockEntity | undefined;
}): JSX.Element | null => {
  /**
   * `similarProducts` is optional on the block entity (the API omits it once a
   * traffic limit kicks in), hence the optional chaining and the empty fallback.
   */
  const products = (block?.similarProducts?.items ?? []).filter(isOfferProduct);

  /** No offers — hide the whole section instead of showing an empty heading. */
  if (products.length < 1) {
    return null;
  }

  /** UI-text dictionary (system_content) with English fallbacks */
  const [dict] = ServerProvider<IAttributeValues>('dict');
  /** Section heading; falls back to the mock's "Best Offers" when the block is not filled */
  const title =
    block?.localizeInfos?.title ||
    (dict?.home_offers_title?.value as string | undefined) ||
    'Best Offers';

  return (
    <section
      className="flex w-full justify-center bg-white py-4 xl:py-10 md:py-6"
      data-testid="home-offers"
    >
      <div className="page-shell mb-6 w-full flex-col">
        <div className="flex w-full flex-col items-center justify-center">
          <SectionTitle title={title} delay={0.25} className="mb-6 md:mb-10" />
          <OffersFeed products={products} />
        </div>
      </div>
    </section>
  );
};

export default OffersFeedBlock;
