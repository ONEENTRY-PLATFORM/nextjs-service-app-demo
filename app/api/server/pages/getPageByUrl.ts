import { unstable_cache } from 'next/cache';
import type { IError } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import { cache } from 'react';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';
import { withTimeout } from '@/app/api/utils/withTimeout';

/**
 * Fetch a page from OneEntry, cached across requests (private helper).
 *
 * The SDK call is a plain fetch that Next.js does not cache on its own, so it
 * is wrapped in `unstable_cache` with a short TTL and invalidation tags.
 * @param   {string}          url - Page marker (`pageUrl`) to fetch
 * @returns {Promise<object>}     Envelope with the page or the error
 */
const getPageByUrlImpl = unstable_cache(
  async (
    url: string,
  ): Promise<{
    isError: boolean;
    error?: IError;
    page?: IPagesEntity;
  }> => {
    try {
      const data = await withTimeout(
        getApi().Pages.getPageByUrl(url),
        10_000,
        'getPageByUrl',
      );

      if (isError(data)) {
        return { isError: true, error: data };
      }
      return { isError: false, page: data };
    } catch (e) {
      return { isError: true, error: e as IError };
    }
  },
  ['oneentry-page-by-url'],
  { revalidate: 60, tags: ['oneentry', 'oneentry-pages'] },
);

/**
 * Get page object with information about forms, blocks, menus, linked to the page by URL
 *
 * This function fetches a page entity by its URL from the OneEntry API. The page entity
 * contains information about forms, blocks, and menus associated with the page.
 *
 * Wrapped in React `cache()` over a cross-request `unstable_cache`, so the same
 * marker requested from `generateMetadata` and the page body within one render
 * hits the API once (most routes fetch the very same page twice).
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
export const getPageByUrl = cache(getPageByUrlImpl);
