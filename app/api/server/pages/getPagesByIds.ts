import { unstable_cache } from 'next/cache';
import type { IError } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import { cache } from 'react';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';
import { withTimeout } from '@/app/api/utils/withTimeout';

/**
 * Fetch several pages by id from OneEntry, cached across requests (private
 * helper).
 *
 * Takes the ids as a comma-separated STRING, not an array: React `cache()`
 * compares arguments by identity, so the fresh array every caller builds would
 * never hit. The public signature keeps taking `number[]`.
 * @param   {string}          idsKey - Page ids joined by `,`
 * @returns {Promise<object>}        Envelope with the pages or the first error
 */
const getPagesByIdsImpl = unstable_cache(
  async (
    idsKey: string,
  ): Promise<{
    isError: boolean;
    error?: IError;
    pages?: IPagesEntity[];
  }> => {
    const ids = idsKey
      .split(',')
      .filter(Boolean)
      .map((id) => Number(id));
    try {
      const data = await Promise.all(
        ids.map((id: number) =>
          withTimeout(getApi().Pages.getPageById(id), 10_000, 'getPageById'),
        ),
      );

      /**
       * `data` is the array of per-id results, so `isError(data)` would never
       * fire (an array has no `statusCode`). Check the elements: each
       * `getPageById` may itself return an `IError`, which must not be cast to
       * a page.
       */
      const failed = data.find((page): page is IError => isError(page));
      if (failed) {
        return { isError: true, error: failed };
      }
      return { isError: false, pages: data as IPagesEntity[] };
    } catch (e) {
      return { isError: true, error: e as IError };
    }
  },
  ['oneentry-pages-by-ids'],
  { revalidate: 60, tags: ['oneentry', 'oneentry-pages'] },
);

/** Request-level dedupe, keyed by the joined ids string. */
const getPagesByIdsCached = cache(getPagesByIdsImpl);

/**
 * Get pages objects by their IDs.
 * @param   {number[]}                                                            ids - Array of page IDs to fetch
 * @returns {Promise<{isError: boolean, error?: IError, pages?: IPagesEntity[]}>}     Promise that resolves to an object containing the result data
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getPagesByIds = async (
  ids: number[],
): Promise<{
  isError: boolean;
  error?: IError;
  pages?: IPagesEntity[];
}> => await getPagesByIdsCached(ids.join(','));
