import type { IError } from 'oneentry/dist/base/utils';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';

import { getApi } from '@/app/api/api/api';
import { createCachedCmsReader } from '@/app/api/utils/createCachedCmsReader';
import { expectCmsArray } from '@/app/api/utils/expectCmsArray';

/**
 * Result envelope of {@link getBlocksByPageUrl}.
 */
type BlocksResult = {
  isError: boolean;
  error?: IError;
  blocks?: IBlockEntity[];
};

/**
 * Cached reader: TTL, request-level dedupe and transient-failure handling.
 *
 * Takes the marker as a primitive so both cache layers key on it: React
 * `cache()` compares arguments by identity, so an object argument (a fresh
 * literal on every call) would never produce a cache hit.
 */
const readBlocksByPageUrl = createCachedCmsReader<[string], IBlockEntity[]>({
  cacheKey: 'oneentry-blocks-by-page-url',
  label: 'getBlocksByPageUrl',
  revalidate: 60,
  tags: ['oneentry', 'oneentry-blocks'],
  call: (pageUrl) => getApi().Pages.getBlocksByPageUrl(pageUrl),
  validate: (data) => expectCmsArray(data, 'getBlocksByPageUrl'),
});

/**
 * getBlocksByPageUrl — get blocks linked to a given page URL (marker).
 * @param   {object}                args         - Argument object
 * @param   {string}                args.pageUrl - Page marker (not a Next.js route path)
 * @returns {Promise<BlocksResult>}              Object containing the blocks array or error
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getBlocksByPageUrl = async ({
  pageUrl,
}: {
  pageUrl: string;
}): Promise<BlocksResult> => {
  const { isError: failed, error, data } = await readBlocksByPageUrl(pageUrl);
  return {
    isError: failed,
    ...(error ? { error } : {}),
    ...(data ? { blocks: data } : {}),
  };
};
