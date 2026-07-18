import getSearchParams from '@/app/api/utils/getSearchParams';
import { PRODUCT_STATUS_IN_STOCK } from '@/app/api/utils/productStatusMarkers';

describe('getSearchParams', () => {
  it('always emits the mandatory "is a service" (has-sku) filter', () => {
    const [filter, ...rest] = getSearchParams();

    expect(rest).toEqual([]);
    expect(filter).toMatchObject({
      attributeMarker: 'sku',
      conditionMarker: 'exs',
      conditionValue: null,
      isNested: false,
      title: '',
    });
  });

  it('passes the search term through as the filter title', () => {
    expect(getSearchParams({ search: 'hair' })[0]?.title).toBe('hair');
  });

  it('adds the in-stock status marker only when in_stock is requested', () => {
    expect(getSearchParams()[0]).not.toHaveProperty('statusMarker');
    expect(getSearchParams({ in_stock: '1' })[0]?.statusMarker).toBe(
      PRODUCT_STATUS_IN_STOCK,
    );
  });
});
