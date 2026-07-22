'use client';

import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';

import { useSearchProductsQuery } from '@/app/api/api/RTKApi';

/**
 * Custom hook for searching products by name using the OneEntry API.
 *
 * A thin adapter over the `searchProducts` RTK Query endpoint: it keeps this
 * hook's original shape (`loading` / `products` / `refetch`) so the search popup
 * did not have to change, while the request itself now goes through the RTK
 * cache. Retyping a term or reopening the popup is served from cache instead of
 * a fresh API call, and two subscribers on the same term share one request —
 * neither was true of the previous `useEffect` + `useState` implementation.
 *
 * Imported straight from `RTKApi`: there is no `@/app/api` barrel in the tree
 * (CLAUDE.md still describes one). A barrel here would also be the wrong shape —
 * it would re-export the server wrappers, which pull in `next/cache`, alongside
 * client hooks like this one.
 * @param   {object} props      - Configuration object for the search
 * @param   {string} props.name - The product name or partial name to search for
 * @returns {object}            An object containing search results and control functions
 * @example
 * ```typescript
 * const { loading, products } = useSearchProducts({ name: 'shampoo' });
 * ```
 */
export const useSearchProducts = ({
  name,
}: {
  name: string;
}): { loading: boolean; products: IProductsEntity[]; refetch: () => void } => {
  /** No query — do not hit the API at all (and keep the popup empty). */
  const { data, isFetching, refetch } = useSearchProductsQuery(
    { name },
    { skip: !name },
  );

  return {
    /**
     * `isFetching`, not `isLoading`: the latter is only true on the very first
     * request for a term, so a spinner would not show while a NEW term loads
     * over previously cached results.
     */
    loading: name ? isFetching : false,
    products: name ? (data ?? []) : [],
    /** Refetching a skipped (empty) query is a no-op, so guard it. */
    refetch: () => {
      if (name) {
        refetch();
      }
    },
  };
};
