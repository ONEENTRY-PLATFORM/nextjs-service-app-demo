import type { IError } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';

import { getApi } from '@/app/api/api/api';
import { createCachedCmsReader } from '@/app/api/utils/createCachedCmsReader';

/** Cached reader: TTL, request-level dedupe and transient-failure handling. */
const readPageByUrl = createCachedCmsReader<[string], IPagesEntity>({
  cacheKey: 'oneentry-page-by-url',
  label: 'getPageByUrl',
  revalidate: 60,
  tags: ['oneentry', 'oneentry-pages'],
  call: (url) => getApi().Pages.getPageByUrl(url),
});

/**
 * Get page object with information about forms, blocks, menus, linked to the page by URL
 *
 * This function fetches a page entity by its URL from the OneEntry API. The page entity
 * contains information about forms, blocks, and menus associated with the page.
 *
 * The same marker requested from `generateMetadata` and the page body within one
 * render hits the API once (most routes fetch the very same page twice), and a
 * transient CMS failure degrades for that request only instead of being cached.
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
): Promise<{ isError: boolean; error?: IError; page?: IPagesEntity }> => {
  const { isError: failed, error, data } = await readPageByUrl(url);
  return {
    isError: failed,
    ...(error ? { error } : {}),
    ...(data ? { page: data } : {}),
  };
};
