import type {
  IError,
  IProductsEntity,
  IProductsResponse,
} from 'oneentry/types';

import { getApi } from '@/app/api/api/api';
import { createCachedCmsReader } from '@/app/api/utils/createCachedCmsReader';
import { expectCmsArray } from '@/app/api/utils/expectCmsArray';

/** Cached reader: TTL, request-level dedupe and transient-failure handling. */
const readRelatedProductsById = createCachedCmsReader<
  [number],
  IProductsResponse
>({
  cacheKey: 'oneentry-related-products-by-id',
  label: 'getRelatedProductsById',
  revalidate: 60,
  tags: ['oneentry', 'oneentry-products'],
  call: (id) => getApi().Products.getRelatedProductsById(id),
  validate: (data) => expectCmsArray(data.items, 'getRelatedProductsById'),
});

/**
 * getRelatedProductsById — get all related product page objects with
 * API.Products.
 *
 * ⚠️ Currently UNUSED — no module imports this wrapper: the design has no "related services" section.
 * Kept per project convention; the split between the server wrappers and the
 * RTK Query endpoints was settled in favour of the latter here.
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
  const { isError: failed, error, data } = await readRelatedProductsById(id);
  return {
    isError: failed,
    ...(error ? { error } : {}),
    ...(data ? { products: data.items } : {}),
    total: data?.total ?? 0,
  };
};
