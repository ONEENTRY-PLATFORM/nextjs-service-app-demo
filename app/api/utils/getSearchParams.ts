import type { IFilterParams } from 'oneentry/dist/products/productsInterfaces';

/**
 * Generate search parameters for product filtering
 *
 * This utility function creates an array of filter parameters based on the provided
 * search parameters and handle. It's used to construct complex queries for the
 * OneEntry API product search functionality.
 * @param   {object}        [searchParams]          - Optional search parameters for filtering products
 * @param   {string}        [searchParams.search]   - Text search term for product titles or descriptions
 * @param   {string}        [searchParams.in_stock] - Filter products by stock availability
 * @param   {string}        [searchParams.color]    - Filter products by color attribute
 * @param   {string}        [searchParams.minPrice] - Minimum price filter
 * @param   {string}        [searchParams.maxPrice] - Maximum price filter
 * @param   {string}        [handle]                - Optional category handle for additional filtering
 * @returns {Array<object>}                         Array of filter parameters for the OneEntry API
 */
const getSearchParams = (
  searchParams?: {
    search?: string;
    in_stock?: string;
    color?: string;
    minPrice?: string;
    maxPrice?: string;
  },
  handle?: string,
): Array<IFilterParams & { statusMarker?: string }> => {
  const expandedFilters:
    Array<IFilterParams & { statusMarker?: string }> | undefined = [];

  /**
   * Keep only products that have an SKU set. The legacy `nin: null`
   * condition stopped matching anything on the current API — `exs`
   * ("attribute exists") is the supported operator for this check.
   */
  const servicesFilter: IFilterParams = {
    attributeMarker: 'sku',
    conditionMarker: 'exs',
    conditionValue: null,
    title: searchParams?.search || '',
    isNested: false,
  };
  expandedFilters.push(servicesFilter);

  if (handle) {
    const stickersFilter: IFilterParams = {
      attributeMarker: 'stickers',
      conditionMarker: 'in',
      conditionValue: handle,
      title: searchParams?.search || '',
      isNested: false,
    };
    expandedFilters.push(stickersFilter);
  }

  if (searchParams?.in_stock) {
    expandedFilters.push({
      statusMarker: 'in_stock',
      attributeMarker: 'price',
      conditionValue: null,
      title: searchParams.search || '',
      isNested: false,
    });
  }

  if (searchParams?.color) {
    const newFilter: IFilterParams = {
      attributeMarker: 'color',
      conditionMarker: 'in',
      conditionValue: searchParams.color,
      title: searchParams.search || '',
      isNested: false,
    };
    expandedFilters.push(newFilter);
  }

  return expandedFilters;
};

export default getSearchParams;
