import type { IError } from 'oneentry/dist/base/utils';
import type { IMenusEntity } from 'oneentry/dist/menus/menusInterfaces';

import { getApi } from '@/app/api/api/api';
import { createCachedCmsReader } from '@/app/api/utils/createCachedCmsReader';

/** Cached reader: TTL, request-level dedupe and transient-failure handling. */
const readMenuByMarker = createCachedCmsReader<[string], IMenusEntity>({
  cacheKey: 'oneentry-menu-by-marker',
  label: 'getMenuByMarker',
  revalidate: 300,
  tags: ['oneentry', 'oneentry-menus'],
  call: (marker) => getApi().Menus.getMenusByMarker(marker),
});

/**
 * Get menu by marker.
 *
 * Wrapped in React `cache()` over a cross-request `unstable_cache`, so the same
 * marker is fetched once per render and reused between requests.
 * @param   {string}          marker - Menu marker
 * @returns {Promise<object>}        Menu object
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getMenuByMarker = async (
  marker: string,
): Promise<{ isError: boolean; error?: IError; menu?: IMenusEntity }> => {
  const { isError: failed, error, data } = await readMenuByMarker(marker);
  return {
    isError: failed,
    ...(error ? { error } : {}),
    ...(data ? { menu: data } : {}),
  };
};
