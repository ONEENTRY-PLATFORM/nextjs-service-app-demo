'use client';

import { useSearchParams } from 'next/navigation';

/**
 * useServicesPrefill — reads the `?services=233,240` query a "Book" button
 * navigates with and returns the product ids to preselect in the wizard.
 *
 * Used by the offer cards: an offer is a product of its own (`offer` set) and
 * is NOT in the booking catalog, so putting its id in the cart preselects
 * nothing. The query carries the ids of the services the offer bundles
 * instead — several of them, which the single-product cart row cannot hold.
 * @returns {number[]} Product ids to preselect (empty when the query is absent)
 */
export const useServicesPrefill = (): number[] => {
  const searchParams = useSearchParams();
  const raw = searchParams.get('services');
  if (!raw) {
    return [];
  }

  return raw
    .split(',')
    .filter((part) => /^\d+$/.test(part))
    .map(Number);
};
