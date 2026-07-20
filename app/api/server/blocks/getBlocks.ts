import { unstable_cache } from 'next/cache';
import type { IError } from 'oneentry/dist/base/utils';
import type {
  BlockType,
  IBlocksResponse,
} from 'oneentry/dist/blocks/blocksInterfaces';
import { cache } from 'react';

import { getApi, isError } from '@/app/api';
import { fetchCmsData } from '@/app/api/utils/fetchCmsData';

/**
 * Fetch blocks of a type from OneEntry, cached across requests (private helper).
 *
 * Takes the type as a primitive so both cache layers key on it: React `cache()`
 * compares arguments by identity, so the public object argument would never hit.
 * @param   {string}          type - Block type identifier
 * @returns {Promise<object>}      Envelope with the blocks or the error
 */
const getBlocksImpl = unstable_cache(
  async (
    type: BlockType,
  ): Promise<{
    isError: boolean;
    error?: IError;
    blocks?: IBlocksResponse;
  }> => {
    const data = await fetchCmsData(
      () => getApi().Blocks.getBlocks(type),
      'getBlocks',
    );
    if (isError(data)) {
      return { isError: true, error: data };
    }
    return { isError: false, blocks: data };
  },
  ['oneentry-blocks-by-type'],
  { revalidate: 60, tags: ['oneentry', 'oneentry-blocks'] },
);

/** Request-level dedupe, keyed by the block type. */
const getBlocksCached = cache(getBlocksImpl);

/**
 * Get blocks by type.
 * @param   {object}          type      - Object containing the type information
 * @param   {string}          type.type - Block type identifier
 * @returns {Promise<object>}           Blocks array
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getBlocks = async ({
  type,
}: {
  type: BlockType;
}): Promise<{
  isError: boolean;
  error?: IError;
  blocks?: IBlocksResponse;
}> => {
  try {
    return await getBlocksCached(type);
  } catch (e) {
    // Transient CMS failure — not cached by unstable_cache; degrade for this
    // request only instead of caching a poisoned result.
    return { isError: true, error: e as IError };
  }
};
