import type { IError } from 'oneentry/dist/base/utils';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';
import getSearchParams from '@/app/api/utils/getSearchParams';

/**
 * Get all products with pagination and filter
 *
 * Fetches products from the OneEntry API with support for pagination, filtering,
 * and search parameters. Returns both the products and total count for pagination.
 * @param   {object}          props                              - Configuration object for the product fetching
 * @param   {number}          props.limit                        - Maximum number of products to fetch per page
 * @param   {number}          props.offset                       - Number of products to skip (for pagination)
 * @param   {object}          props.params                       - Optional filtering and search parameters
 * @param   {string}          props.params.handle                - Category handle to filter products
 * @param   {object}          props.params.searchParams          - Additional search parameters
 * @param   {string}          props.params.searchParams.search   - Search term to filter products
 * @param   {string}          props.params.searchParams.in_stock - Filter products by stock status
 * @param   {string}          props.params.searchParams.color    - Filter products by color attribute
 * @param   {string}          props.params.searchParams.minPrice - Minimum price filter
 * @param   {string}          props.params.searchParams.maxPrice - Maximum price filter
 * @returns {Promise<object>}                                    Promise that resolves to an object containing products, error status, and total count
 * @see {@link https://oneentry.cloud/instructions/npm/|OneEntry docs}
 */
export const getProducts = async (props: {
  limit: number;
  offset: number;
  params?: {
    handle?: string;
    searchParams?: {
      search?: string;
      in_stock?: string;
      color?: string;
      minPrice?: string;
      maxPrice?: string;
    };
  };
}): Promise<{
  isError: boolean;
  error?: IError;
  products?: IProductsEntity[];
  total: number;
}> => {
  const { limit, offset, params } = props;
  const expandedFilters = getSearchParams(params?.searchParams, params?.handle);

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
};
