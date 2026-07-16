import { unstable_cache } from 'next/cache';
import type { IError } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import { cache } from 'react';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';

/**
 * Fetch a page by id from OneEntry, cached across requests (private helper).
 *
 * The SDK call is a plain fetch that Next.js does not cache on its own, so it
 * is wrapped in `unstable_cache` with a short TTL and invalidation tags.
 * @param   {number}          id - Page id
 * @returns {Promise<object>}    Envelope with the page or the error
 */
const getPageByIdImpl = unstable_cache(
  async (
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
  },
  ['oneentry-page-by-id'],
  { revalidate: 60, tags: ['oneentry', 'oneentry-pages'] },
);

/**
 * Get page object with information about forms, blocks, menus, linked to the page.
 *
 * Wrapped in React `cache()` over a cross-request `unstable_cache`: the same id
 * requested twice within one render hits the API once, and repeat renders reuse
 * the cached page until the TTL lapses.
 * @param   {number}          id - Page id.
 * @returns {Promise<object>}    Returns PageEntity object.
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getPageById = cache(getPageByIdImpl);
