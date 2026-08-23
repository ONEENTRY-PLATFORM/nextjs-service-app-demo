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
 * compares arguments by identity, so the fresh object literal every caller
 * builds would never produce a hit. An empty `search`/`inStock` behaves exactly
 * like the absent `searchParams` of the public signature — `getSearchParams`
 * treats both as "no filter".
 */
const readProductsByPageUrl = createCachedCmsReader<
  [string, number, number, boolean, string, string],
  IProductsResponse
>({
  cacheKey: 'oneentry-products-by-page-url',
  label: 'getProductsByPageUrl',
  revalidate: 60,
  tags: ['oneentry', 'oneentry-products'],
  call: (handle, limit, offset, servicesOnly, search, inStock) =>
    getApi().Products.getProductsByPageUrl(
      handle,
      servicesOnly ? getSearchParams({ search, in_stock: inStock }) : [],
      undefined,
      {
        sortOrder: 'DESC',
        sortKey: 'date',
        offset: offset,
        limit: limit,
      },
    ),
  validate: (data) => expectCmsArray(data.items, 'getProductsByPageUrl'),
});

/**
 * getProductsByPageUrl — get all products with pagination for the selected
 * category.
 *
 * `params.handle` is the OneEntry CMS `pageUrl` marker for a catalog page —
 * it happens to coincide with the Next.js `[handle]` route segment. NOT a
 * Next.js path; do not include locale or leading slash.
 * @param   {object}          props                              - Configuration object for the product fetching
 * @param   {number}          props.limit                        - Maximum number of products to fetch per page
 * @param   {number}          props.offset                       - Number of products to skip (for pagination)
 * @param   {object}          props.params                       - Optional filtering and search parameters
 * @param   {string}          props.params.handle                - Catalog page marker (pageUrl from CMS, e.g. `'haircut'`)
 * @param   {object}          props.params.searchParams          - Additional search parameters
 * @param   {string}          props.params.searchParams.search   - Search term to filter products
 * @param   {string}          props.params.searchParams.in_stock - Filter products by stock status
 * @param   {boolean}         props.servicesOnly                 - Keep only catalog services (products with an `sku`); defaults to `true`. Set `false` for pages holding non-service products such as `offer`s (they carry `offer_sku`, not `sku`).
 * @returns {Promise<object>}                                    Promise that resolves to an object containing products, error status, and total count
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getProductsByPageUrl = async (props: {
  limit: number;
  offset: number;
  servicesOnly?: boolean;
  params: {
    handle: string;
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
  const { limit, offset, servicesOnly = true, params } = props;
  const {
    isError: failed,
    error,
    data,
  } = await readProductsByPageUrl(
    params.handle,
    limit,
    offset,
    servicesOnly,
    params.searchParams?.search ?? '',
    params.searchParams?.in_stock ?? '',
  );
  return {
    isError: failed,
    ...(error ? { error } : {}),
    ...(data ? { products: data.items } : {}),
    total: data?.total ?? 0,
  };
};
