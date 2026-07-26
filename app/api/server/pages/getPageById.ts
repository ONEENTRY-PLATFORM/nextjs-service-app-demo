import type { IError } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';

import { getApi } from '@/app/api/api/api';
import { createCachedCmsReader } from '@/app/api/utils/createCachedCmsReader';
import { expectCmsEntity } from '@/app/api/utils/expectCmsEntity';

/** Cached reader: TTL, request-level dedupe and transient-failure handling. */
const readPageById = createCachedCmsReader<[number], IPagesEntity>({
  cacheKey: 'oneentry-page-by-id',
  label: 'getPageById',
  revalidate: 60,
  tags: ['oneentry', 'oneentry-pages'],
  call: (id) => getApi().Pages.getPageById(id),
  validate: (data) => expectCmsEntity(data, 'getPageById', 'id'),
});

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
export const getPageById = async (
  id: number,
): Promise<{ isError: boolean; error?: IError; page?: IPagesEntity }> => {
  const { isError: failed, error, data } = await readPageById(id);
  return {
    isError: failed,
    ...(error ? { error } : {}),
    ...(data ? { page: data } : {}),
  };
};
