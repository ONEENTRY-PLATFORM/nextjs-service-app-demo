import type { IError } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';

/**
 * Get page object with information about forms, blocks, menus, linked to the page.
 * @param   {number}          id - Page id.
 * @returns {Promise<object>}    Returns PageEntity object.
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getPageById = async (
  id: number,
): Promise<{
  isError: boolean;
  error?: IError;
  page?: IPagesEntity;
}> => {
  try {
    const data = await getApi().Pages.getPageById(id);

    if (isError(data)) {
      return { isError: true, error: data };
    }
    return { isError: false, page: data };
  } catch (e) {
    return { isError: true, error: e as IError };
  }
};
