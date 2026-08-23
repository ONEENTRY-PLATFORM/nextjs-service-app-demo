import type { IProductsEntity } from 'oneentry/types';

/**
 * Currency code of a product's price, from its CMS `currency` attribute.
 *
 * Read defensively: the attribute exists on both the `service` and `offer` sets
 * (flagged `isCurrency`), but its value may be empty while the CMS is being
 * filled — `CurrencySymbol` treats `''` as "use the default glyph".
 * @param   {IProductsEntity | undefined} product - Product entity from the Products API
 * @returns {string}                              Currency code (e.g. `'AED'`), or `''` when unset
 */
export const productCurrency = (
  product: IProductsEntity | undefined,
): string => {
  const value = (
    product?.attributeValues as
      Record<string, { value?: unknown } | undefined> | undefined
  )?.currency?.value;
  return typeof value === 'string' ? value : '';
};
