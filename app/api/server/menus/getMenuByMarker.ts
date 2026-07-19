import { unstable_cache } from 'next/cache';
import type { IError } from 'oneentry/dist/base/utils';
import type { IMenusEntity } from 'oneentry/dist/menus/menusInterfaces';
import { cache } from 'react';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';
import { withTimeout } from '@/app/api/utils/withTimeout';

/**
 * Fetch a menu from OneEntry, cached across requests (private helper).
 *
 * Menus change rarely but are read on every single page render (the root layout
 * needs `main`, the header needs `user_menu`), so they are cached with a longer
 * TTL and invalidation tags.
 * @param   {string}          marker - Menu marker
 * @returns {Promise<object>}        Envelope with the menu or the error
 */
const getMenuByMarkerImpl = unstable_cache(
  async (
    marker: string,
  ): Promise<{
    isError: boolean;
    error?: IError;
    menu?: IMenusEntity;
  }> => {
    try {
      const data = await withTimeout(
        getApi().Menus.getMenusByMarker(marker),
        10_000,
        'getMenuByMarker',
      );

      if (isError(data)) {
        return { isError: true, error: data };
      }
      return { isError: false, menu: data };
    } catch (e) {
      return { isError: true, error: e as IError };
    }
  },
  ['oneentry-menu-by-marker'],
  { revalidate: 300, tags: ['oneentry', 'oneentry-menus'] },
);

/**
 * Get menu by marker.
 *
 * Wrapped in React `cache()` over a cross-request `unstable_cache`, so the same
 * marker is fetched once per render and reused between requests.
 * @param   {string}          marker - Menu marker
 * @returns {Promise<object>}        Menu object
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getMenuByMarker = cache(getMenuByMarkerImpl);
