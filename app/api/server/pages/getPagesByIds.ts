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
      ids.map(async (id: number) => {
        const page = await getApi().Pages.getPageById(id);
        return page;
      }),
    ).then((results) => results);

    if (isError(data)) {
      return { isError: true, error: data };
    }
    return { isError: false, pages: data as IPagesEntity[] };
  } catch (e) {
    return { isError: true, error: e as IError };
  }
};
