'use client';

import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import { useEffect, useState } from 'react';

import { getApi } from '@/app/api';

/**
 * Custom hook for searching products by name using the OneEntry API.
 *
 * This hook provides functionality to search for products by their name or partial name.
 * It handles loading states and provides a method to refetch results. The hook automatically
 * performs a search when the name parameter changes and provides a way to manually trigger
 * a new search.
 * @param   {object} props      - Configuration object for the search
 * @param   {string} props.name - The product name or partial name to search for
 * @returns {object}            An object containing search results and control functions
 * @example
 * ```typescript
 * const { loading, products, refetch } = useSearchProducts({ name: 'shampoo' });
 *
 * useEffect(() => {
 *   if (!loading) {
 *     console.log('Found products:', products);
 *   }
 * }, [loading, products]);
 *
 * // Manually trigger a new search
 * const handleSearch = () => {
 *   refetch();
 * };
 * ```
 */
export const useSearchProducts = ({
  name,
}: {
  name: string;
}): { loading: boolean; products: IProductsEntity[]; refetch: () => void } => {
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<IProductsEntity[]>([]);
  const [refetch, setRefetch] = useState(false);

  /** search products on data change */
  useEffect(() => {
    if (!name) {
      return;
    }
    (async () => {
      setLoading(true);
      const result = await getApi().Products.searchProduct(name);
      setProducts(result as IProductsEntity[]);
      setLoading(false);
    })();
  }, [refetch, name]);

  return {
    loading,
    products,
    refetch() {
      setRefetch(!refetch);
    },
  };
};
