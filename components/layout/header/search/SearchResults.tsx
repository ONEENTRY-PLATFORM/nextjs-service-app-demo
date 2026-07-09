'use client';

import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { Dispatch, JSX, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

import { getPageById } from '@/app/api';
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
  /** State to store page data associated with products */
  const [pages, setPages] = useState<{
    [key: number]: {
      page?: IPagesEntity;
    };
  }>({});
  /** Fetch products based on search value using custom hook */
  const { loading, products } = useSearchProducts({
    name: searchValue,
  });

  /** Effect to fetch page data for products when products change */
  useEffect(() => {
    /** Function to fetch page data for all products */
    const fetchPages = async () => {
      /** Initialize object to store page data with product IDs as keys */
      const pagesData: {
        [key: number]: {
          page?: IPagesEntity;
        };
      } = {};
      /** Fetch page data for each product concurrently */
      await Promise.all(
        products.map(async (product) => {
          /** Only fetch page data if product has associated pages */
          const firstPage = product.productPages?.[0];
          if (firstPage) {
            const pageData = await getPageById(firstPage.pageId);
            pagesData[product.id] = pageData;
          }
        }),
      );
      /** Update state with fetched page data */
      setPages(pagesData);
    };

    /** Trigger page data fetching only if there are products */
    if (products.length > 0) {
      fetchPages();
    }
  }, [products]);

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
        products.map((product: IProductsEntity, i: number) => {
          const { id, attributeSetIdentifier } = product;

          /** Skip rendering for 'service_product' type */
          if (attributeSetIdentifier === 'service_product' || !pages[id]) {
            return null;
          }

          return (
            <div key={id + i} className="flex w-full">
              <ProductRow
                pageData={pages[id].page as IPagesEntity}
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
