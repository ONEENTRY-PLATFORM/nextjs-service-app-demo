import { unstable_cache } from 'next/cache';
import type { IError } from 'oneentry/dist/base/utils';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import { cache } from 'react';

import { getApi, isError } from '@/app/api';
import { fetchCmsData } from '@/app/api/utils/fetchCmsData';

/**
 * Fetch a product from OneEntry, cached across requests (private helper).
 *
 * The SDK call is a plain fetch that Next.js does not cache on its own, so it
 * is wrapped in `unstable_cache` with a short TTL and invalidation tags.
 * @param   {number}          id - The numeric ID of the product to fetch
 * @returns {Promise<object>}    Envelope with the product or the error
 */
const getProductByIdImpl = unstable_cache(
  async (
    id: number,
  ): Promise<{
    isError: boolean;
    error?: IError;
    product?: IProductsEntity;
  }> => {
    const data = await fetchCmsData(
      () => getApi().Products.getProductById(id),
      'getProductById',
    );
    if (isError(data)) {
      return { isError: true, error: data };
    }
    return { isError: false, product: data };
  },
  ['oneentry-product-by-id'],
  { revalidate: 60, tags: ['oneentry', 'oneentry-products'] },
);

/** Request-level dedupe over the cross-request cache. */
const getProductByIdCached = cache(getProductByIdImpl);

/**
 * Get product by ID from the OneEntry API
 *
 * This function fetches a specific product by its ID from the OneEntry API.
 * It handles error cases and returns a consistent response format.
 *
 * Wrapped in React `cache()` over a cross-request `unstable_cache`.
 * @param   {number}          id - The numeric ID of the product to fetch
 * @returns {Promise<object>}    Promise that resolves to an object containing the product data or error information
 * @see {@link https://oneentry.cloud/instructions/npm|OneEntry docs}
 */
export const getProductById = async (
  id: number,
): Promise<{ isError: boolean; error?: IError; product?: IProductsEntity }> => {
  try {
    return await getProductByIdCached(id);
  } catch (e) {
    // Transient CMS failure — not cached by unstable_cache; degrade for this
    // request only instead of caching a poisoned result.
    return { isError: true, error: e as IError };
  }
};
