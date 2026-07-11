import type { IFilterParams } from 'oneentry/dist/products/productsInterfaces';

/**
 * Generate search parameters for product filtering
 *
 * Builds the filter array for the OneEntry Products API. Only two filters are
 * supported: the mandatory "is a service" filter (product has an `sku`, plus the
 * optional search term) and the optional in-stock status filter.
 * @param   {object}        [searchParams]          - Optional search parameters for filtering products
 * @param   {string}        [searchParams.search]   - Text search term for product titles or descriptions
 * @param   {string}        [searchParams.in_stock] - Filter products by stock availability
 * @returns {Array<object>}                         Array of filter parameters for the OneEntry API
 */
const getSearchParams = (searchParams?: {
  search?: string;
  in_stock?: string;
}): Array<IFilterParams & { statusMarker?: string }> => {
  const expandedFilters: Array<IFilterParams & { statusMarker?: string }> = [];

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

  if (searchParams?.in_stock) {
    expandedFilters.push({
      statusMarker: 'in_stock',
      attributeMarker: 'price',
      conditionValue: null,
      title: searchParams.search || '',
      isNested: false,
    });
  }

  return expandedFilters;
};

export default getSearchParams;
