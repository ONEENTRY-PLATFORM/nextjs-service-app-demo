import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';

import { productCurrency } from '@/components/shared/productCurrency';

const productWith = (value: unknown): IProductsEntity =>
  ({ attributeValues: { currency: { value } } }) as unknown as IProductsEntity;

describe('productCurrency', () => {
  it('reads the currency code string from the CMS attribute', () => {
    expect(productCurrency(productWith('AED'))).toBe('AED');
  });

  it('returns an empty string while the attribute is unset', () => {
    // CurrencySymbol treats '' as "use the default glyph"
    expect(productCurrency(productWith(''))).toBe('');
    expect(productCurrency(productWith(undefined))).toBe('');
  });

  it('returns an empty string for a non-string value or a missing product', () => {
    expect(productCurrency(productWith(123))).toBe('');
    expect(productCurrency(undefined)).toBe('');
    expect(productCurrency({} as IProductsEntity)).toBe('');
  });
});
