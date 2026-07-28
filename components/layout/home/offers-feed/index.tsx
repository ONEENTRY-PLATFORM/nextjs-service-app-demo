import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

import { getBookingData } from '@/app/booking/booking-data';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { slimOfferBookingData } from '@/components/layout/offer-booking/utils/slimOfferBookingData';
import SectionTitle from '@/components/shared/SectionTitle';
import { dictText } from '@/components/utils/dictText';
import { isOfferProduct } from '@/components/utils/isOfferProduct';

import OffersFeed from './components/OffersFeed';

/**
 * OffersFeedBlock component displays the complete offers section with title and
 * feed. Special offers are the `offer` products curated on the
 * `home_offers_feed` block as similar products, which the page's block list
 * already carries — so they are read straight off the prop rather than refetched.
 * The booking data behind the cards' offer booking modal IS fetched here —
 * `getBookingData` (request-memoized, its readers TTL-cached and shared with
 * the `/booking` route) slimmed by {@link slimOfferBookingData} before it is
 * serialized into the page payload.
 * The whole section is hidden while the CMS holds no `offer` products.
 * @param   {object}             props         - Component properties
 * @param   {IBlockEntity}       [props.block] - The `home_offers_feed` block
 * @returns {Promise<JSX.Element | null>}      The offers section, or `null` when empty
 */
const OffersFeedBlock = async ({
  block,
}: {
  block?: IBlockEntity | undefined;
}): Promise<JSX.Element | null> => {
  /**
   * `similarProducts` is optional on the block entity (the API omits it once a
   * traffic limit kicks in), hence the optional chaining and the empty fallback.
   */
  const products = (block?.similarProducts?.items ?? []).filter(isOfferProduct);

  /** No offers — hide the whole section instead of showing an empty heading. */
  if (products.length < 1) {
    return null;
  }

  /** Salons / services / specialists the cards' booking modal runs on. */
  const bookingData = slimOfferBookingData(await getBookingData());

  /** UI-text dictionary (system_content) with English fallbacks */
  const [dict] = ServerProvider<IAttributeValues>('dict');
  /** Section heading; falls back to the mock's "Best Offers" when the block is not filled */
  const title =
    block?.localizeInfos?.title ||
    dictText(dict, 'home_offers_title', 'Best Offers');

  return (
    <section
      className="flex w-full justify-center bg-white py-4 xl:py-10 md:py-6"
      data-testid="home-offers"
    >
      <div className="page-shell mb-6 w-full flex-col">
        <div className="flex w-full flex-col items-center justify-center">
          <SectionTitle title={title} delay={0.25} className="mb-6 md:mb-10" />
          <OffersFeed products={products} bookingData={bookingData} />
        </div>
      </div>
    </section>
  );
};

export default OffersFeedBlock;
