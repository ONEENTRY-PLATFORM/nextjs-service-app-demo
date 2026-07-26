import type { IError } from 'oneentry/dist/base/utils';
import type {
  BlockType,
  IBlockEntity,
  IBlocksResponse,
} from 'oneentry/dist/blocks/blocksInterfaces';

import { getApi } from '@/app/api/api/api';
import { createCachedCmsReader } from '@/app/api/utils/createCachedCmsReader';
import { expectCmsArray } from '@/app/api/utils/expectCmsArray';

/**
 * Cached reader: TTL, request-level dedupe and transient-failure handling.
 *
 * Takes the type as a primitive so both cache layers key on it: React `cache()`
 * compares arguments by identity, so the public object argument would never hit.
 */
const readBlocks = createCachedCmsReader<[BlockType], IBlocksResponse>({
  cacheKey: 'oneentry-blocks-by-type',
  label: 'getBlocks',
  revalidate: 60,
  tags: ['oneentry', 'oneentry-blocks'],
  call: (type) => getApi().Blocks.getBlocks(type),
  validate: (data) => expectCmsArray(data.items, 'getBlocks'),
});

/**
 * getBlocks — get blocks by type.
 *
 * ⚠️ Currently UNUSED — no module imports this wrapper: RTK Query (`getBlocksByPageUrl` / `getBlockByMarker`) covers every block read the app performs.
 * Kept per project convention; the split between the server wrappers and the
 * RTK Query endpoints was settled in favour of the latter here.
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
  blocks?: IBlockEntity[];
  total: number;
}> => {
  const { isError: failed, error, data } = await readBlocks(type);
  return {
    isError: failed,
    ...(error ? { error } : {}),
    ...(data ? { blocks: data.items } : {}),
    total: data?.total ?? 0,
  };
};
