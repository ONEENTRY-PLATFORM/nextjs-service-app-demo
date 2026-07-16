'use client';

import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { Dispatch, JSX, SetStateAction } from 'react';

import { useSearchProducts } from '@/app/api/hooks/useSearchProducts';
import Spinner from '@/components/shared/Spinner';

import CloseSearch from './CloseSearch';
import ProductRow from './ProductRow';

/**
 * SearchResults component to display live search results for products.
 *
 * This component fetches and displays product search results based on the search value.
 * It retrieves associated page data for each product and renders them in a dropdown list.
 * The component handles loading states and provides a way to close the search results.
 * @param   {object}                            props             - Component properties
 * @param   {string}                            props.searchValue - Current search term to filter products
 * @param   {boolean}                           props.state       - Boolean indicating if search results should be displayed
 * @param   {Dispatch<SetStateAction<boolean>>} props.setState    - Function to update the visibility state of search results
 * @returns {JSX.Element}                                         JSX.Element representing the search results dropdown or null if not active
 */
const SearchResults = ({
  searchValue,
  state,
  setState,
}: {
  searchValue: string;
  state: boolean;
  setState: Dispatch<SetStateAction<boolean>>;
}): JSX.Element => {
  /** Fetch products based on search value using custom hook */
  const { loading, products } = useSearchProducts({
    name: searchValue,
  });

  /** Show loading spinner while products are being fetched */
  if (loading) {
    return <Spinner />;
  }

  /** Don't render search results if search is not active */
  if (!state) {
    return <></>;
  }

  /** Render search results dropdown with products */
  return (
    <div
      data-testid="search-results"
      className="absolute top-full left-0 z-30 mt-px flex w-full flex-col gap-1 rounded-2xl bg-white p-5 shadow-lg"
    >
      <CloseSearch setState={setState} />
      {products.length > 0 ? (
        products.map((product: IProductsEntity) => {
          const { id, attributeSetIdentifier } = product;
          const pageId = product.productPages?.[0]?.pageId;

          /** Skip special-offer products — they are not services. */
          if (attributeSetIdentifier === 'offer' || !pageId) {
            return null;
          }

          return (
            <div key={id} className="flex w-full">
              {/* The row resolves (and caches) its own page — see ProductRow. */}
              <ProductRow
                pageId={pageId}
                product={product}
                setState={setState}
              />
            </div>
          );
        })
      ) : (
        <p>No products found</p>
      )}
    </div>
  );
};

export default SearchResults;
