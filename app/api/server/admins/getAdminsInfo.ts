import type { IAdminEntity, IError, IFilterParams } from 'oneentry/types';

import { getApi } from '@/app/api/api/api';
import { createCachedCmsReader } from '@/app/api/utils/createCachedCmsReader';
import { expectCmsArray } from '@/app/api/utils/expectCmsArray';

/**
 * Cached reader: TTL, request-level dedupe and transient-failure handling.
 *
 * The SDK call is a POST that Next.js does not cache on its own. The full
 * roster once weighed ~8.7 MB (over the 2 MB data-cache limit, so caching only
 * produced a failed write plus an `unhandledRejection`); after the per-admin
 * attributes were trimmed on the CMS it is ~0.3 MB and caches cleanly.
 */
const readAdminsInfo = createCachedCmsReader<
  [IFilterParams[], number, number],
  IAdminEntity[]
>({
  cacheKey: 'oneentry-admins-info',
  label: 'getAdminsInfo',
  revalidate: 60,
  tags: ['oneentry', 'oneentry-admins'],
  call: (body, offset, limit) =>
    getApi().Admins.getAdminsInfo(body, undefined, offset, limit),
  validate: (data) => expectCmsArray(data, 'getAdminsInfo'),
});

/**
 * getAdminsInfo — get administrators information from the API.
 *
 * This function fetches administrator information from the OneEntry API based on
 * the provided parameters. It returns either the administrator data or an error
 * object. The same query twice within one render hits the API once, and repeat
 * renders reuse the cached roster until the TTL lapses.
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
  const {
    isError: failed,
    error,
    data,
  } = await readAdminsInfo(body, offset, limit);
  return {
    isError: failed,
    ...(error ? { error } : {}),
    ...(data ? { admins: data } : {}),
  };
};
