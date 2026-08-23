import type { IBlockSlidesResponse, IError } from 'oneentry/types';

import { getApi } from '@/app/api/api/api';
import { createCachedCmsReader } from '@/app/api/utils/createCachedCmsReader';
import { expectCmsArray } from '@/app/api/utils/expectCmsArray';

/** Cached reader: TTL, request-level dedupe and transient-failure handling. */
const readBlockSlides = createCachedCmsReader<[string], IBlockSlidesResponse>({
  cacheKey: 'oneentry-block-slides',
  label: 'getBlockSlides',
  revalidate: 60,
  tags: ['oneentry', 'oneentry-blocks'],
  call: (marker) => getApi().Blocks.getSlides(marker),
  validate: (data) => expectCmsArray(data.items, 'getBlockSlides'),
});

/**
 * getBlockSlides — get slides of a slider block by its marker (`slider_block`
 * type only).
 *
 * Slides of a slider block are NOT part of the block's `attributeValues` —
 * they are fetched separately. Each slide carries its own `attributeValues`
 * where file attributes are raw arrays (e.g. `image_id1: [{ downloadLink }]`).
 *
 * The same marker requested twice in one render hits the API once, and a
 * transient CMS failure degrades for that request only instead of being cached.
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
  const { isError: failed, error, data } = await readBlockSlides(marker);
  return {
    isError: failed,
    ...(error ? { error } : {}),
    ...(data ? { slides: data } : {}),
  };
};
