import { unstable_cache } from 'next/cache';
import type { IError } from 'oneentry/dist/base/utils';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import { cache } from 'react';

import { getApi, isError as isSdkError } from '@/app/api';
import { fetchCmsData } from '@/app/api/utils/fetchCmsData';

/**
 * Fetch a block from OneEntry, cached across requests (private helper).
 *
 * The SDK call is a plain fetch that Next.js does not cache on its own, so it
 * is wrapped in `unstable_cache` with a short TTL and invalidation tags.
 * @param   {string}          marker - Marker of the Block to fetch
 * @returns {Promise<object>}        Envelope with the block or the error
 */
const getBlockByMarkerImpl = unstable_cache(
  async (
    marker: string,
  ): Promise<{
    isError: boolean;
    error?: IError;
    block?: IBlockEntity;
  }> => {
    const data = await fetchCmsData(
      () => getApi().Blocks.getBlockByMarker(marker),
      'getBlockByMarker',
    );
    if (isSdkError(data)) {
      return { isError: true, error: data };
    }
    return { isError: false, block: data };
  },
  ['oneentry-block-by-marker'],
  { revalidate: 60, tags: ['oneentry', 'oneentry-blocks'] },
);

/** Request-level dedupe over the cross-request cache. */
const getBlockByMarkerCached = cache(getBlockByMarkerImpl);

/**
 * Get block by marker from the OneEntry API
 *
 * This function fetches a block entity by its marker from the OneEntry API.
 * Blocks are used to manage content sections in the application.
 *
 * Wrapped in React `cache()` over a cross-request `unstable_cache`, so the same
 * marker requested twice in one render hits the API once.
 * @param   {string}          marker - Marker of the Block to fetch
 * @returns {Promise<object>}        Promise that resolves to an object containing the block data or error information
 * @see {@link https://oneentry.cloud/instructions/npm|OneEntry docs}
 * @example
 * ```typescript
 * const { isError, block, error } = await getBlockByMarker('hero_section');
 *
 * if (!isError && block) {
 *   console.log('Block:', block);
 * } else {
 *   console.error('Error fetching block:', error);
 * }
 * ```
 */
export const getBlockByMarker = async (
  marker: string,
): Promise<{ isError: boolean; error?: IError; block?: IBlockEntity }> => {
  try {
    return await getBlockByMarkerCached(marker);
  } catch (e) {
    // Transient CMS failure — not cached by unstable_cache; degrade for this
    // request only instead of caching a poisoned result.
    return { isError: true, error: e as IError };
  }
};
