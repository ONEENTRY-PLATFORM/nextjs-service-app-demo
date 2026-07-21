import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';

import { parseOffer } from '@/components/layout/home/offers-feed/components/parseOffer';

/**
 * Build an `offer` product stub. Only the fields `parseOffer` reads are set;
 * the deep SDK type is bypassed with a cast, which is the point here.
 * @param   {object}          attributeValues    - Raw `attributeValues` map
 * @param   {object}          [extra]            - Optional top-level overrides
 * @param   {string}          [extra.title]      - `localizeInfos.title`
 * @param   {number}          [extra.price]      - Top-level product `price`
 * @param   {string}          [extra.plainValue] - `localizeInfos.plainValue`
 * @returns {IProductsEntity}                    Offer product stub
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

describe('parseOffer', () => {
  it('reads the name, bundled services and first service parent id', () => {
    const view = parseOffer(
      makeOffer({
        offer_services: {
          value: [
            { title: 'Haircut', value: { id: 5, parentId: 12 } },
            { title: 'Blow-dry', value: { id: 6, parentId: 13 } },
          ],
        },
      }),
    );

    expect(view.name).toBe('Glow Package');
    expect(view.services).toEqual(['Haircut', 'Blow-dry']);
    expect(view.firstServiceParentId).toBe(12);
  });

  it('detects the "(featured)" flag and strips it from the name', () => {
    const view = parseOffer(
      makeOffer({}, { title: 'Glow Package (featured)' }),
    );
    expect(view.featured).toBe(true);
    expect(view.name).toBe('Glow Package');
  });

  it('is not featured without the flag', () => {
    expect(parseOffer(makeOffer({})).featured).toBe(false);
  });

  it('computes price, crossed-out original and the discount percent', () => {
    const view = parseOffer(
      makeOffer({
        offer_sale: { value: '150' },
        offer_price: { value: '200' },
      }),
    );

    expect(view.price).toBe(150);
    expect(view.original).toBe(200);
    expect(view.discount).toBe(25);
  });

  it('shows no discount when the sale price is not below the original', () => {
    const view = parseOffer(
      makeOffer({
        offer_sale: { value: '200' },
        offer_price: { value: '150' },
      }),
    );

    expect(view.discount).toBe(0);
  });

  it('falls back to product.price when offer_sale is unset', () => {
    expect(parseOffer(makeOffer({}, { price: 370 })).price).toBe(370);
  });

  it('prefers offer_description, else falls back to plainValue', () => {
    expect(
      parseOffer(makeOffer({ offer_description: { value: 'Pamper yourself' } }))
        .tagline,
    ).toBe('Pamper yourself');

    expect(
      parseOffer(makeOffer({}, { plainValue: 'From the page' })).tagline,
    ).toBe('From the page');
  });

  describe('accent colour', () => {
    it('maps a category title to its brand accent and two-tone gradient', () => {
      const view = parseOffer(
        makeOffer({ offer_type: { value: [{ title: 'Hair' }] } }),
      );

      expect(view.accentColor).toBe('#ed21f1');
      // Brand accents carry the mock's light→dark pair
      // (`offerAccentGradientsData`), not a shade of the accent itself
      expect(view.accentGrad).toBe('linear-gradient(135deg,#f60efb,#ed21f1)');
    });

    it('derives a gradient from the colour when it is not a brand accent', () => {
      const view = parseOffer(
        makeOffer({ offer_type: { value: [{ value: '#123456' }] } }),
      );

      expect(view.accentGrad).toBe(
        'linear-gradient(135deg, #123456, #123456cc)',
      );
    });

    it('falls back to the per-category colour for a non-Hair category', () => {
      expect(
        parseOffer(makeOffer({ offer_type: { value: [{ title: 'Body' }] } }))
          .accentColor,
      ).toBe('#109aa9');
    });

    it('accepts a raw hex from the list value', () => {
      expect(
        parseOffer(makeOffer({ offer_type: { value: [{ value: '#123456' }] } }))
          .accentColor,
      ).toBe('#123456');
    });

    it('defaults to pink when offer_type is absent', () => {
      expect(parseOffer(makeOffer({})).accentColor).toBe('#ed21f1');
    });
  });
});
