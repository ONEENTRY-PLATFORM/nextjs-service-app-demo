import type { IError, IPagesEntity } from 'oneentry/types';

import { getApi, isError } from '@/app/api/api/api';
import { createCachedCmsReader } from '@/app/api/utils/createCachedCmsReader';
import { expectCmsEntity } from '@/app/api/utils/expectCmsEntity';
import { fetchCmsData } from '@/app/api/utils/fetchCmsData';

/**
 * Cached reader: TTL, request-level dedupe and transient-failure handling.
 *
 * Takes the ids as a comma-separated STRING, not an array: React `cache()`
 * compares arguments by identity, so the fresh array every caller builds would
 * never hit. The public signature keeps taking `number[]`.
 *
 * The thunk fans out into one `fetchCmsData` per id, so each page keeps its own
 * timeout / retry / transient-vs-stable classification: any transient element
 * rejects the whole `Promise.all` and nothing is cached, while a stable
 * per-page `IError` stays in the array for the wrapper to surface. `validate`
 * rejects shell-mode `{}` elements that the per-id classification cannot see.
 */
const readPagesByIds = createCachedCmsReader<
  [string],
  (IPagesEntity | IError)[]
>({
  cacheKey: 'oneentry-pages-by-ids',
  label: 'getPagesByIds',
  revalidate: 60,
  tags: ['oneentry', 'oneentry-pages'],
  call: (idsKey) => {
    const ids = idsKey
      .split(',')
      .filter(Boolean)
      .map((id) => Number(id));
    return Promise.all(
      ids.map((id: number) =>
        fetchCmsData(() => getApi().Pages.getPageById(id), 'getPageById'),
      ),
    );
  },
  validate: (data) => {
    for (const page of data) {
      if (!isError(page)) {
        expectCmsEntity<IPagesEntity>(page, 'getPagesByIds', 'id');
      }
    }
  },
});

/**
 * getPagesByIds — get pages objects by their IDs.
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
}> => {
  const { isError: failed, error, data } = await readPagesByIds(ids.join(','));
  if (failed || !data) {
    return { isError: true, ...(error ? { error } : {}) };
  }

  /**
   * `data` is the array of per-id results — each `getPageById` may itself have
   * returned a stable `IError`, which must not be cast to a page.
   */
  const failedPage = data.find((page): page is IError => isError(page));
  if (failedPage) {
    return { isError: true, error: failedPage };
  }
  return { isError: false, pages: data as IPagesEntity[] };
};
