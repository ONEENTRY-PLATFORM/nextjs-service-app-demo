import { unstable_cache } from 'next/cache';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IError } from 'oneentry/dist/base/utils';
import type { IFilterParams } from 'oneentry/dist/products/productsInterfaces';
import { cache } from 'react';

import { getApi, isError } from '@/app/api';
import { fetchCmsData } from '@/app/api/utils/fetchCmsData';

/**
 * Fetch administrators (masters) from OneEntry, cached across requests (private
 * helper).
 *
 * The SDK call is a POST that Next.js does not cache on its own, so it is
 * wrapped in `unstable_cache` with a short TTL and invalidation tags. The full
 * roster once weighed ~8.7 MB (over the 2 MB data-cache limit, so caching only
 * produced a failed write plus an `unhandledRejection`); after the per-admin
 * attributes were trimmed on the CMS it is ~0.3 MB and caches cleanly.
 * @param   {IFilterParams[]} body   - Array of body/filter parameters for the request
 * @param   {number}          offset - Offset for pagination
 * @param   {number}          limit  - Maximum number of items to return
 * @returns {Promise<object>}        Envelope with the admins or the error
 */
const getAdminsInfoImpl = unstable_cache(
  async (
    body: IFilterParams[],
    offset: number,
    limit: number,
  ): Promise<{
    isError: boolean;
    error?: IError;
    admins?: IAdminEntity[];
  }> => {
    const data = await fetchCmsData(
      () => getApi().Admins.getAdminsInfo(body, undefined, offset, limit),
      'getAdminsInfo',
    );
    if (isError(data)) {
      return { isError: true, error: data };
    }
    return { isError: false, admins: data };
  },
  ['oneentry-admins-info'],
  { revalidate: 60, tags: ['oneentry', 'oneentry-admins'] },
);

/** Request-level dedupe over the cross-request cache. */
const getAdminsInfoCached = cache(getAdminsInfoImpl);

/**
 * Get administrators information from the API
 *
 * This function fetches administrator information from the OneEntry API based on
 * the provided parameters. It returns either the administrator data or an error
 * object. Wrapped in React `cache()` over a cross-request `unstable_cache`: the
 * same query twice within one render hits the API once, and repeat renders reuse
 * the cached roster until the TTL lapses.
 * @param   {object}          props        - Function parameters
 * @param   {IFilterParams[]} props.body   - Array of body parameters for the request
 * @param   {number}          props.offset - Offset for pagination
 * @param   {number}          props.limit  - Maximum number of items to return
 * @returns {Promise<object>}              Promise that resolves to an object containing administrator data or error information
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getAdminsInfo = async ({
  body,
  offset,
  limit,
}: {
  body: IFilterParams[];
  offset: number;
  limit: number;
}): Promise<{
  isError: boolean;
  error?: IError;
  admins?: IAdminEntity[];
}> => {
  try {
    return await getAdminsInfoCached(body, offset, limit);
  } catch (e) {
    // Transient CMS failure — not cached by unstable_cache; degrade for this
    // request only instead of caching a poisoned result.
    return { isError: true, error: e as IError };
  }
};
