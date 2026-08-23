import type {
  IError,
  IProductsEntity,
  IProductsResponse,
} from 'oneentry/types';

import { getApi } from '@/app/api/api/api';
import { createCachedCmsReader } from '@/app/api/utils/createCachedCmsReader';
import { expectCmsArray } from '@/app/api/utils/expectCmsArray';
import getSearchParams from '@/app/api/utils/getSearchParams';

/**
 * Cached reader: TTL, request-level dedupe and transient-failure handling.
 *
 * Takes primitives rather than the public object argument: React `cache()`
 * compares arguments by identity, so a fresh object literal would never hit. An
 * empty `search`/`inStock` behaves exactly like the absent `searchParams` of the
 * public signature — `getSearchParams` treats both as "no filter".
 */
const readProducts = createCachedCmsReader<
  [number, number, string, string],
  IProductsResponse
>({
  cacheKey: 'oneentry-products',
  label: 'getProducts',
  revalidate: 60,
  tags: ['oneentry', 'oneentry-products'],
  call: (limit, offset, search, inStock) =>
    getApi().Products.getProducts(
      getSearchParams({ search, in_stock: inStock }),
      undefined,
      {
        /**
         * Same order as `getProductsByPageUrl` — the two wrappers used to sort
         * the same catalog in OPPOSITE directions (ASC here, DESC there),
         * which would have been a confusing bug the moment both fed one screen.
         *
         * Note this is creation date, not the admin-controlled `position`: the
         * catalog order cannot be curated from the admin panel today. Switching
         * to `position` is a product decision — it visibly reorders services.
         */
        sortOrder: 'DESC',
        sortKey: 'date',
        offset: offset,
        limit: limit,
      },
    ),
  validate: (data) => expectCmsArray(data.items, 'getProducts'),
});

/**
 * getProducts — get all products with pagination and filter.
 *
 * ⚠️ Currently UNUSED — no module imports this wrapper: the catalog reads products through `getProductsByPageUrl` / `getProductsByIds`.
 * Kept per project convention; the split between the server wrappers and the
 * RTK Query endpoints was settled in favour of the latter here.
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
  const {
    isError: failed,
    error,
    data,
  } = await readProducts(
    limit,
    offset,
    params?.searchParams?.search ?? '',
    params?.searchParams?.in_stock ?? '',
  );
  return {
    isError: failed,
    ...(error ? { error } : {}),
    ...(data ? { products: data.items } : {}),
    total: data?.total ?? 0,
  };
};
