import { unstable_cache } from 'next/cache';
import type { IError } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import { cache } from 'react';

import { getApi, isError } from '@/app/api';
import { fetchCmsData } from '@/app/api/utils/fetchCmsData';

/**
 * Fetch child pages from OneEntry, cached across requests (private helper).
 *
 * The catalog tree is read repeatedly (menus, category grids, gallery
 * taxonomy), so it is cached with a TTL and invalidation tags.
 * @param   {string}          url - Parent page marker
 * @returns {Promise<object>}     Envelope with the child pages or the error
 */
const getChildPagesByParentUrlImpl = unstable_cache(
  async (
    url: string,
  ): Promise<{
    isError: boolean;
    error?: IError;
    pages?: IPagesEntity[];
  }> => {
    const data = await fetchCmsData(
      () => getApi().Pages.getChildPagesByParentUrl(url),
      'getChildPagesByParentUrl',
    );
    if (isError(data)) {
      return { isError: true, error: data };
    }
    return { isError: false, pages: data };
  },
  ['oneentry-child-pages-by-parent-url'],
  { revalidate: 60, tags: ['oneentry', 'oneentry-pages'] },
);

/** Request-level dedupe over the cross-request cache. */
const getChildPagesByParentUrlCached = cache(getChildPagesByParentUrlImpl);

/**
 * Get child pages object with information as an array.
 *
 * Wrapped in React `cache()` over a cross-request `unstable_cache`.
 * @param   {string}          url - Page URL.
 * @returns {Promise<object>}     Returns all created pages as an array of PageEntity objects or an empty array [] (if there is no data) for the selected parent
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getChildPagesByParentUrl = async (
  url: string,
): Promise<{ isError: boolean; error?: IError; pages?: IPagesEntity[] }> => {
  try {
    return await getChildPagesByParentUrlCached(url);
  } catch (e) {
    // Transient CMS failure — not cached by unstable_cache; degrade for this
    // request only instead of caching a poisoned result.
    return { isError: true, error: e as IError };
  }
};
