import type { IBlockEntity, IError } from 'oneentry/types';

import { getApi } from '@/app/api/api/api';
import { createCachedCmsReader } from '@/app/api/utils/createCachedCmsReader';
import { expectCmsEntity } from '@/app/api/utils/expectCmsEntity';

/** Cached reader: TTL, request-level dedupe and transient-failure handling. */
const readBlockByMarker = createCachedCmsReader<[string], IBlockEntity>({
  cacheKey: 'oneentry-block-by-marker',
  label: 'getBlockByMarker',
  revalidate: 60,
  tags: ['oneentry', 'oneentry-blocks'],
  call: (marker) => getApi().Blocks.getBlockByMarker(marker),
  validate: (data) => expectCmsEntity(data, 'getBlockByMarker', 'id'),
});

/**
 * Get block by marker from the OneEntry API
 *
 * This function fetches a block entity by its marker from the OneEntry API.
 * Blocks are used to manage content sections in the application.
 *
 * The same marker requested twice in one render hits the API once, and a
 * transient CMS failure degrades for that request only instead of being cached.
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
  const { isError: failed, error, data } = await readBlockByMarker(marker);
  return {
    isError: failed,
    ...(error ? { error } : {}),
    ...(data ? { block: data } : {}),
  };
};
