import type { IError, IPagesEntity } from 'oneentry/types';

import { getApi } from '@/app/api/api/api';
import { createCachedCmsReader } from '@/app/api/utils/createCachedCmsReader';
import { expectCmsArray } from '@/app/api/utils/expectCmsArray';

/**
 * Cached reader: TTL, request-level dedupe and transient-failure handling.
 *
 * The catalog tree is read repeatedly (menus, category grids, gallery
 * taxonomy), so it is cached with a TTL and invalidation tags.
 */
const readChildPagesByParentUrl = createCachedCmsReader<
  [string],
  IPagesEntity[]
>({
  cacheKey: 'oneentry-child-pages-by-parent-url',
  label: 'getChildPagesByParentUrl',
  revalidate: 60,
  tags: ['oneentry', 'oneentry-pages'],
  call: (url) => getApi().Pages.getChildPagesByParentUrl(url),
  validate: (data) => expectCmsArray(data, 'getChildPagesByParentUrl'),
});

/**
 * getChildPagesByParentUrl — get child pages object with information as an
 * array.
 *
 * The same parent requested twice in one render hits the API once, and a
 * transient CMS failure degrades for that request only instead of being cached.
 * @param   {string}          url - Page URL.
 * @returns {Promise<object>}     Returns all created pages as an array of PageEntity objects or an empty array [] (if there is no data) for the selected parent
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getChildPagesByParentUrl = async (
  url: string,
): Promise<{ isError: boolean; error?: IError; pages?: IPagesEntity[] }> => {
  const { isError: failed, error, data } = await readChildPagesByParentUrl(url);
  return {
    isError: failed,
    ...(error ? { error } : {}),
    ...(data ? { pages: data } : {}),
  };
};
