import { unstable_cache } from 'next/cache';
import type { IError } from 'oneentry/dist/base/utils';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import { cache } from 'react';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';

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
    try {
      const data = await getApi().Products.getRelatedProductsById(id);

      if (isError(data)) {
        return { isError: true, error: data, total: 0 };
      }
      return {
        isError: false,
        products: data.items,
        total: data.total,
      };
    } catch (e) {
      return { isError: true, error: e as IError, total: 0 };
    }
  },
  ['oneentry-related-products-by-id'],
  { revalidate: 60, tags: ['oneentry', 'oneentry-products'] },
);

/**
 * Get all related product page objects with API.Products
 *
 * Wrapped in React `cache()` over a cross-request `unstable_cache`.
 * @param   {number}          id - Product page identifier for which to find relationship.
 * @returns {Promise<object>}    Promise that resolves to an object containing products, error status, and total count
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getRelatedProductsById = cache(getRelatedProductsByIdImpl);
