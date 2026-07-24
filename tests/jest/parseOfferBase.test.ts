import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';

import { parseOffer } from '@/components/layout/home/offers-feed/components/parseOffer';
import { parseOfferDetail } from '@/components/layout/offers-page/parseOfferDetail';
import { parseOfferBase } from '@/components/utils/parseOfferBase';

/**
 * Build an `offer` product stub. Only the fields the parser reads are set; the
 * deep SDK type is bypassed with a cast, which is the point here.
 * @param   {object}          attributeValues - Raw `attributeValues` map
 * @param   {number}          [price]         - Top-level product `price`
 * @returns {IProductsEntity}                 Offer product stub
 */
const makeOffer = (
  attributeValues: Record<string, { value: unknown }>,
  price = 0,
): IProductsEntity =>
  ({
    localizeInfos: { title: 'Glow Package' },
    price,
    attributeValues,
  }) as unknown as IProductsEntity;

describe('parseOfferBase — empty entity attributes', () => {
  /**
   * The CMS returns the empty STRING for an entity attribute with nothing
   * selected, not an empty array. The old parsers cast that to an array and
   * called `.map` on it, which throws. Both cards must degrade to "no services".
   */
  it('survives the empty string the CMS sends for an unset entity', () => {
    const product = makeOffer({ offer_services: { value: '' } });

    expect(() => parseOfferBase(product)).not.toThrow();
    expect(parseOfferBase(product).services).toEqual([]);
    expect(parseOfferBase(product).serviceProductIds).toEqual([]);
  });

  it('survives it through both call sites too', () => {
    const product = makeOffer({ offer_services: { value: '' } });

    expect(parseOffer(product).services).toEqual([]);
    expect(parseOfferDetail(product).services).toEqual([]);
  });

  it('ignores a non-array value of any other shape', () => {
    expect(
      parseOfferBase(makeOffer({ offer_services: { value: { id: 1 } } }))
        .services,
    ).toEqual([]);
  });
});

describe('parseOfferBase — one arithmetic for both cards', () => {
  const PRICED = {
    offer_sale: { value: 590 },
    offer_price: { value: 700 },
    offer_type: { value: [{ title: 'Face' }] },
  };

  it('computes price, original and discount once', () => {
    expect(parseOfferBase(makeOffer(PRICED))).toMatchObject({
      price: 590,
      original: 700,
      discount: 16,
    });
  });

  it('gives both cards identical pricing and accent', () => {
    const product = makeOffer(PRICED);
    const home = parseOffer(product);
    const detail = parseOfferDetail(product);

    expect(home.price).toBe(detail.price);
    expect(home.original).toBe(detail.original);
    expect(home.discount).toBe(detail.discount);
    expect(home.accentColor).toBe(detail.accentColor);
    expect(home.accentGrad).toBe(detail.accentGrad);
  });

  it('falls back to the top-level product price', () => {
    expect(parseOfferBase(makeOffer({}, 370)).price).toBe(370);
  });

  it('hides the discount when the original is not higher', () => {
    expect(
      parseOfferBase(
        makeOffer({ offer_sale: { value: 700 }, offer_price: { value: 700 } }),
      ).discount,
    ).toBe(0);
  });

  it('resolves the accent from a hex, a category, then pink', () => {
    expect(
      parseOfferBase(
        makeOffer({ offer_type: { value: [{ value: '#109AA9' }] } }),
      ).accentColor,
    ).toBe('#109AA9');
    expect(
      parseOfferBase(makeOffer({ offer_type: { value: [{ title: 'Face' }] } }))
        .accentColor,
    ).toBe('#9b4fb2');
    expect(parseOfferBase(makeOffer({})).accentColor).toBe('#ed21f1');
  });
});
