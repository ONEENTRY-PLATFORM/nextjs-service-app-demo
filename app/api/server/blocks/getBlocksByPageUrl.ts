import { unstable_cache } from 'next/cache';
import type { IError } from 'oneentry/dist/base/utils';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import { cache } from 'react';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';

/**
 * Result envelope of {@link getBlocksByPageUrl}.
 */
type BlocksResult = {
  isError: boolean;
  error?: IError;
  blocks?: IBlockEntity[];
};

/**
 * Fetch page blocks from OneEntry, cached across requests (private helper).
 *
 * Takes the marker as a primitive so both cache layers key on it: React
 * `cache()` compares arguments by identity, so an object argument (a fresh
 * literal on every call) would never produce a cache hit.
 * @param   {string}                pageUrl - Page marker
 * @returns {Promise<BlocksResult>}         Envelope with the blocks or the error
 */
const getBlocksByPageUrlImpl = unstable_cache(
  async (pageUrl: string): Promise<BlocksResult> => {
    try {
      const data = await getApi().Pages.getBlocksByPageUrl(pageUrl);
      if (isError(data)) {
        return { isError: true, error: data };
      }
      return { isError: false, blocks: data };
    } catch (e) {
      return { isError: true, error: e as IError };
    }
  },
  ['oneentry-blocks-by-page-url'],
  { revalidate: 60, tags: ['oneentry', 'oneentry-blocks'] },
);

/** Request-level dedupe, keyed by the marker string. */
const getBlocksByPageUrlCached = cache(getBlocksByPageUrlImpl);

/**
 * Get blocks linked to a given page URL (marker).
 * @param   {object}          args         - Argument object
 * @param   {string}          args.pageUrl - Page marker (not a Next.js route path)
 * @returns {Promise<object>}              Object containing the blocks array or error
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getBlocksByPageUrl = async ({
  pageUrl,
}: {
  pageUrl: string;
}): Promise<BlocksResult> => await getBlocksByPageUrlCached(pageUrl);
