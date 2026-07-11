import type { IError } from 'oneentry/dist/base/utils';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';
import getSearchParams from '@/app/api/utils/getSearchParams';

/**
 * Get all products with pagination for the selected category.
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
 * @returns {Promise<object>}                                    Promise that resolves to an object containing products, error status, and total count
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getProductsByPageUrl = async (props: {
  limit: number;
  offset: number;
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
  const { limit, offset, params } = props;
  const expandedFilters = getSearchParams(params.searchParams);

  try {
    const data = await getApi().Products.getProductsByPageUrl(
      params.handle,
      expandedFilters,
      undefined,
      {
        sortOrder: 'DESC',
        sortKey: 'date',
        offset: offset,
        limit: limit,
      },
    );

    if (isError(data)) {
      return { isError: true, error: data, total: 0 };
    }
    return { isError: false, products: data.items, total: data.total };
  } catch (e) {
    return { isError: true, error: e as IError, total: 0 };
  }
};
