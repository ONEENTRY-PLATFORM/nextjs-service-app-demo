import type { IError } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';

/**
 * Get page object with information about forms, blocks, menus, linked to the page by URL
 *
 * This function fetches a page entity by its URL from the OneEntry API. The page entity
 * contains information about forms, blocks, and menus associated with the page.
 *
 * NOTE: `url` is the OneEntry page marker (`pageUrl` from the admin panel),
 * NOT a Next.js route path — pass `'services'`, never `'/services/haircut'`.
 * @param   {string}          url - Page marker (`pageUrl`) to fetch
 * @returns {Promise<object>}     Promise that resolves to an object containing the result data
 * @see {@link https://oneentry.cloud/instructions/npm|OneEntry docs}
 * @example
 * ```typescript
 * const { isError, page, error } = await getPageByUrl('services');
 *
 * if (!isError && page) {
 *   console.log('Page:', page);
 * } else {
 *   console.error('Error fetching page:', error);
 * }
 * ```
 */
export const getPageByUrl = async (
  url: string,
): Promise<{
  isError: boolean;
  error?: IError;
  page?: IPagesEntity;
}> => {
  try {
    const data = await getApi().Pages.getPageByUrl(url);

    if (isError(data)) {
      return { isError: true, error: data };
    }
    return { isError: false, page: data };
  } catch (e) {
    return { isError: true, error: e as IError };
  }
};
