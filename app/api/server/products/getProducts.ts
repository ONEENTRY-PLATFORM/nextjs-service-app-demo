import { unstable_cache } from 'next/cache';
import type { IError } from 'oneentry/dist/base/utils';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import { cache } from 'react';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';
import getSearchParams from '@/app/api/utils/getSearchParams';

/**
 * Fetch products from OneEntry, cached across requests (private helper).
 *
 * Takes primitives rather than the public object argument: React `cache()`
 * compares arguments by identity, so a fresh object literal would never hit. An
 * empty `search`/`inStock` behaves exactly like the absent `searchParams` of the
 * public signature — `getSearchParams` treats both as "no filter".
 * @param   {number}          limit   - Maximum number of products to fetch per page
 * @param   {number}          offset  - Number of products to skip
 * @param   {string}          search  - Search term, `''` when unused
 * @param   {string}          inStock - Stock filter, `''` when unused
 * @returns {Promise<object>}         Envelope with the products, total, or the error
 */
const getProductsImpl = unstable_cache(
  async (
    limit: number,
    offset: number,
    search: string,
    inStock: string,
  ): Promise<{
    isError: boolean;
    error?: IError;
    products?: IProductsEntity[];
    total: number;
  }> => {
    const expandedFilters = getSearchParams({ search, in_stock: inStock });

    try {
      const data = await getApi().Products.getProducts(
        expandedFilters,
        undefined,
        {
          sortOrder: 'ASC',
          sortKey: 'date',
          offset: offset,
          limit: limit,
        },
      );
      if (isError(data)) {
        return { isError: true, error: data, total: 0 };
      }
      return {
        isError: false,
        products: data.items,
        total: data.total,
      };
    } catch (e) {
      return {
        isError: true,
        error: e as IError,
        total: 0,
      };
    }
  },
  ['oneentry-products'],
  { revalidate: 60, tags: ['oneentry', 'oneentry-products'] },
);

/** Request-level dedupe, keyed by the flattened primitives. */
const getProductsCached = cache(getProductsImpl);

/**
 * Get all products with pagination and filter
 *
 * Fetches products from the OneEntry API with support for pagination, filtering,
 * and search parameters. Returns both the products and total count for pagination.
 * @param   {object}          props                              - Configuration object for the product fetching
 * @param   {number}          props.limit                        - Maximum number of products to fetch per page
 * @param   {number}          props.offset                       - Number of products to skip (for pagination)
 * @param   {object}          props.params                       - Optional filtering and search parameters
 * @param   {object}          props.params.searchParams          - Additional search parameters
 * @param   {string}          props.params.searchParams.search   - Search term to filter products
 * @param   {string}          props.params.searchParams.in_stock - Filter products by stock status
 * @returns {Promise<object>}                                    Promise that resolves to an object containing products, error status, and total count
 * @see {@link https://oneentry.cloud/instructions/npm/|OneEntry docs}
 */
export const getProducts = async (props: {
  limit: number;
  offset: number;
  params?: {
    searchParams?: {
      search?: string;
      in_stock?: string;
    };
  };
}): Promise<{
  isError: boolean;
  error?: IError;
  products?: IProductsEntity[];
  total: number;
}> => {
  const { limit, offset, params } = props;
  return await getProductsCached(
    limit,
    offset,
    params?.searchParams?.search ?? '',
    params?.searchParams?.in_stock ?? '',
  );
};
