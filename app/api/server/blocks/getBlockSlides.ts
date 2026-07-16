import { unstable_cache } from 'next/cache';
import type { IError } from 'oneentry/dist/base/utils';
import type { IBlockSlidesResponse } from 'oneentry/dist/blocks/blocksInterfaces';
import { cache } from 'react';

import { getApi } from '@/app/api';
import { isError as isSdkError } from '@/app/api';

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
    try {
      const data = await getApi().Blocks.getSlides(marker);

      if (isSdkError(data)) {
        return { isError: true, error: data };
      }
      return { isError: false, slides: data };
    } catch (e) {
      return { isError: true, error: e as IError };
    }
  },
  ['oneentry-block-slides'],
  { revalidate: 60, tags: ['oneentry', 'oneentry-blocks'] },
);

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
export const getBlockSlides = cache(getBlockSlidesImpl);
