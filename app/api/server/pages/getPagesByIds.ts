import type { IError } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';

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
}> => {
  try {
    const data = await Promise.all(
      ids.map((id: number) => getApi().Pages.getPageById(id)),
    );

    /**
     * `data` is the array of per-id results, so `isError(data)` would never fire
     * (an array has no `statusCode`). Check the elements: each `getPageById` may
     * itself return an `IError`, which must not be cast to a page.
     */
    const failed = data.find((page): page is IError => isError(page));
    if (failed) {
      return { isError: true, error: failed };
    }
    return { isError: false, pages: data as IPagesEntity[] };
  } catch (e) {
    return { isError: true, error: e as IError };
  }
};
