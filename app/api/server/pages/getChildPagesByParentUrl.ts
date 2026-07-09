import type { IError } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';

/**
 * Get child pages object with information as an array.
 * @param   {string}          url - Page URL.
 * @returns {Promise<object>}     Returns all created pages as an array of PageEntity objects or an empty array [] (if there is no data) for the selected parent
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getChildPagesByParentUrl = async (
  url: string,
): Promise<{
  isError: boolean;
  error?: IError;
  pages?: IPagesEntity[];
}> => {
  try {
    const data = await getApi().Pages.getChildPagesByParentUrl(url);
    if (isError(data)) {
      return { isError: true, error: data };
    }
    return { isError: false, pages: data };
  } catch (e) {
    return { isError: true, error: e as IError };
  }
};
