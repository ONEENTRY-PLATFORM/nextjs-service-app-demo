import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';

import { offerAccentGradientsData, offerBannersData } from '@/components/data';
import { parseOfferDetail } from '@/components/layout/offers-page/parseOfferDetail';

/**
 * Build an `offer` product stub. Only the fields `parseOfferDetail` reads are
 * set; the deep SDK type is bypassed with a cast, which is the point here.
 * @param   {object}          attributeValues - Raw `attributeValues` map
 * @param   {object}          [extra]         - `title` / `price` / `plainValue`
 * @returns {IProductsEntity}                 Offer product stub
 */
const makeOffer = (
  attributeValues: Record<string, { value: unknown }>,
  extra: { title?: string; price?: number; plainValue?: string } = {},
): IProductsEntity =>
  ({
    localizeInfos: {
      title: extra.title ?? 'Glow Package',
      plainValue: extra.plainValue,
    },
    price: extra.price ?? 0,
    attributeValues,
  }) as unknown as IProductsEntity;

describe('parseOfferDetail', () => {
  it('reads the name, bundled services and first service parent id', () => {
    const view = parseOfferDetail(
      makeOffer({
        offer_services: {
          value: [
            { title: 'Haircut', value: { id: 5, parentId: 12 } },
            { title: 'Blow-dry', value: { id: 6, parentId: 13 } },
          ],
        },
      }),
      0,
    );

    expect(view.name).toBe('Glow Package');
    expect(view.services).toEqual(['Haircut', 'Blow-dry']);
    expect(view.firstServiceParentId).toBe(12);
  });

  it('computes price, crossed-out original and the discount percent', () => {
    const view = parseOfferDetail(
      makeOffer({
        offer_sale: { value: '150' },
        offer_price: { value: '200' },
      }),
      0,
    );

    expect(view.price).toBe(150);
    expect(view.original).toBe(200);
    expect(view.discount).toBe(25);
  });

  it('shows no discount when the sale price is not below the original', () => {
    const view = parseOfferDetail(
      makeOffer({
        offer_sale: { value: '200' },
        offer_price: { value: '150' },
      }),
      0,
    );

    expect(view.discount).toBe(0);
  });

  it('falls back to product.price when offer_sale is unset', () => {
    const view = parseOfferDetail(makeOffer({}, { price: 370 }), 0);
    expect(view.price).toBe(370);
  });

  it('prefers offer_description, else falls back to plainValue', () => {
    expect(
      parseOfferDetail(
        makeOffer({ offer_description: { value: 'Pamper yourself' } }),
        0,
      ).description,
    ).toBe('Pamper yourself');

    expect(
      parseOfferDetail(makeOffer({}, { plainValue: 'From the page' }), 0)
        .description,
    ).toBe('From the page');
  });

  describe('accent colour', () => {
    it('maps a category title to its brand accent and gradient', () => {
      const view = parseOfferDetail(
        makeOffer({ offer_type: { value: [{ title: 'Hair' }] } }),
        0,
      );

      expect(view.accentColor).toBe('#ed21f1');
      expect(view.accentGrad).toBe(offerAccentGradientsData['#ed21f1']);
    });

    it('accepts a raw hex and builds a same-colour gradient when unmapped', () => {
      const view = parseOfferDetail(
        makeOffer({ offer_type: { value: [{ value: '#123456' }] } }),
        0,
      );

      expect(view.accentColor).toBe('#123456');
      expect(view.accentGrad).toBe(
        'linear-gradient(135deg, #123456, #123456cc)',
      );
    });

    it('defaults to pink when offer_type is absent', () => {
      expect(parseOfferDetail(makeOffer({}), 0).accentColor).toBe('#ed21f1');
    });
  });

  describe('image', () => {
    it('uses the CMS offer_image downloadLink (object or array shape)', () => {
      expect(
        parseOfferDetail(
          makeOffer({ offer_image: { value: { downloadLink: 'https://cdn/a.jpg' } } }),
          0,
        ).image,
      ).toBe('https://cdn/a.jpg');

      expect(
        parseOfferDetail(
          makeOffer({ offer_image: { value: [{ downloadLink: 'https://cdn/b.jpg' }] } }),
          0,
        ).image,
      ).toBe('https://cdn/b.jpg');
    });

    it('cycles a local fallback banner by card index when no photo is set', () => {
      const view = parseOfferDetail(makeOffer({}), 1);
      expect(view.image).toBe(offerBannersData[1 % offerBannersData.length]);
    });
  });

  describe('duration', () => {
    it('passes a string offer_time through', () => {
      expect(
        parseOfferDetail(makeOffer({ offer_time: { value: '2 hours' } }), 0)
          .duration,
      ).toBe('2 hours');
    });

    it('appends " min" to a numeric offer_time', () => {
      expect(
        parseOfferDetail(makeOffer({ offer_time: { value: 90 } }), 0).duration,
      ).toBe('90 min');
    });

    it('is empty when offer_time is unset (hides the pill)', () => {
      expect(parseOfferDetail(makeOffer({}), 0).duration).toBe('');
    });
  });
});
