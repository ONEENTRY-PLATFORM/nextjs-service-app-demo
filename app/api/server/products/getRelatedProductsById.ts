import { unstable_cache } from 'next/cache';
import type { IError } from 'oneentry/dist/base/utils';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import { cache } from 'react';

import { getApi, isError } from '@/app/api/api/api';
import { fetchCmsData } from '@/app/api/utils/fetchCmsData';

/**
 * Fetch a product's related products from OneEntry, cached across requests
 * (private helper).
 *
 * The SDK call is a plain fetch that Next.js does not cache on its own, so it
 * is wrapped in `unstable_cache` with a short TTL and invalidation tags.
 * @param   {number}          id - Product page identifier for which to find relationship.
 * @returns {Promise<object>}    Envelope with the products, total, or the error
 */
const getRelatedProductsByIdImpl = unstable_cache(
  async (
    id: number,
  ): Promise<{
    isError: boolean;
    error?: IError;
    products?: IProductsEntity[];
    total: number;
  }> => {
    const data = await fetchCmsData(
      () => getApi().Products.getRelatedProductsById(id),
      'getRelatedProductsById',
    );
    if (isError(data)) {
      return { isError: true, error: data, total: 0 };
    }
    return {
      isError: false,
      products: data.items,
      total: data.total,
    };
  },
  ['oneentry-related-products-by-id'],
  { revalidate: 60, tags: ['oneentry', 'oneentry-products'] },
);

/** Request-level dedupe over the cross-request cache. */
const getRelatedProductsByIdCached = cache(getRelatedProductsByIdImpl);

/**
 * Get all related product page objects with API.Products
 *
 * ⚠️ Currently UNUSED — no module imports this wrapper: the design has no "related services" section.
 * Kept per project convention; the split between the server wrappers and the
 * RTK Query endpoints was settled in favour of the latter here.
 *
 * Wrapped in React `cache()` over a cross-request `unstable_cache`.
 * @param   {number}          id - Product page identifier for which to find relationship.
 * @returns {Promise<object>}    Promise that resolves to an object containing products, error status, and total count
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getRelatedProductsById = async (
  id: number,
): Promise<{
  isError: boolean;
  error?: IError;
  products?: IProductsEntity[];
  total: number;
}> => {
  try {
    return await getRelatedProductsByIdCached(id);
  } catch (e) {
    // Transient CMS failure — not cached by unstable_cache; degrade for this
    // request only instead of caching a poisoned result.
    return { isError: true, error: e as IError, total: 0 };
  }
};
