import type { IFilterParams } from 'oneentry/types';

import { PRODUCT_STATUS_IN_STOCK } from '@/app/api/utils/productStatusMarkers';

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
}): IFilterParams[] => {
  const expandedFilters: IFilterParams[] = [];

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
    /**
     * `statusMarker` is a global modifier of the body, not a filter of its own:
     * it rides on an existing record. A separate record is only needed when the
     * body has no other filters — and `servicesFilter` is always present here.
     * The previous second record was not a valid catch-all either (it carried
     * `attributeMarker: 'price'` with no `conditionMarker`), so its semantics
     * were undefined.
     */
    ...(searchParams?.in_stock
      ? { statusMarker: PRODUCT_STATUS_IN_STOCK }
      : {}),
  };
  expandedFilters.push(servicesFilter);

  return expandedFilters;
};

export default getSearchParams;
