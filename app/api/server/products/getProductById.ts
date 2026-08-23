import type { IError, IProductsEntity } from 'oneentry/types';

import { getApi } from '@/app/api/api/api';
import { createCachedCmsReader } from '@/app/api/utils/createCachedCmsReader';
import { expectCmsEntity } from '@/app/api/utils/expectCmsEntity';

/** Cached reader: TTL, request-level dedupe and transient-failure handling. */
const readProductById = createCachedCmsReader<[number], IProductsEntity>({
  cacheKey: 'oneentry-product-by-id',
  label: 'getProductById',
  revalidate: 60,
  tags: ['oneentry', 'oneentry-products'],
  call: (id) => getApi().Products.getProductById(id),
  validate: (data) => expectCmsEntity(data, 'getProductById', 'id'),
});

/**
 * Get product by ID from the OneEntry API
 *
 * ⚠️ Currently UNUSED — no module imports this wrapper: single products are read through the catalog lists, never one at a time.
 * Kept per project convention; the split between the server wrappers and the
 * RTK Query endpoints was settled in favour of the latter here.
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
  const { isError: failed, error, data } = await readProductById(id);
  return {
    isError: failed,
    ...(error ? { error } : {}),
    ...(data ? { product: data } : {}),
  };
};
