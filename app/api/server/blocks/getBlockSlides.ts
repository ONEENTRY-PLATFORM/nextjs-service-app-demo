import { unstable_cache } from 'next/cache';
import type { IError } from 'oneentry/dist/base/utils';
import type { IBlockSlidesResponse } from 'oneentry/dist/blocks/blocksInterfaces';
import { cache } from 'react';

import { getApi, isError as isSdkError } from '@/app/api/api/api';
import { fetchCmsData } from '@/app/api/utils/fetchCmsData';

/**
 * Fetch a slider block's slides from OneEntry, cached across requests (private
 * helper).
 *
 * The SDK call is a plain fetch that Next.js does not cache on its own, so it
 * is wrapped in `unstable_cache` with a short TTL and invalidation tags.
 * @param   {string}          marker - Marker of the slider block to fetch slides for
 * @returns {Promise<object>}        Envelope with the slides or the error
 */
const getBlockSlidesImpl = unstable_cache(
  async (
    marker: string,
  ): Promise<{
    isError: boolean;
    error?: IError;
    slides?: IBlockSlidesResponse;
  }> => {
    const data = await fetchCmsData(
      () => getApi().Blocks.getSlides(marker),
      'getBlockSlides',
    );
    if (isSdkError(data)) {
      return { isError: true, error: data };
    }
    return { isError: false, slides: data };
  },
  ['oneentry-block-slides'],
  { revalidate: 60, tags: ['oneentry', 'oneentry-blocks'] },
);

/** Request-level dedupe over the cross-request cache. */
const getBlockSlidesCached = cache(getBlockSlidesImpl);

/**
 * Get slides of a slider block by its marker (`slider_block` type only).
 *
 * Slides of a slider block are NOT part of the block's `attributeValues` —
 * they are fetched separately. Each slide carries its own `attributeValues`
 * where file attributes are raw arrays (e.g. `image_id1: [{ downloadLink }]`).
 *
 * Wrapped in React `cache()` over a cross-request `unstable_cache`.
 * @param   {string}          marker - Marker of the slider block to fetch slides for
 * @returns {Promise<object>}        Promise that resolves to an object containing the slides data or error information
 */
export const getBlockSlides = async (
  marker: string,
): Promise<{
  isError: boolean;
  error?: IError;
  slides?: IBlockSlidesResponse;
}> => {
  try {
    return await getBlockSlidesCached(marker);
  } catch (e) {
    // Transient CMS failure — not cached by unstable_cache; degrade for this
    // request only instead of caching a poisoned result.
    return { isError: true, error: e as IError };
  }
};
