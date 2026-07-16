import { unstable_cache } from 'next/cache';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IError } from 'oneentry/dist/base/utils';
import type { IFilterParams } from 'oneentry/dist/products/productsInterfaces';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';

/**
 * Fetch the admins from OneEntry, cached across requests (private helper).
 *
 * The masters roster changes rarely, hence the 5-minute TTL. No React `cache()`
 * layer here: `body` is an array, which `cache()` compares by identity, so it
 * would never hit — request-level dedupe is provided by `getMastersList`, the
 * single call site, which takes no arguments.
 * @param   {IFilterParams[]} body   - Array of body parameters for the request
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
    try {
      const data = await getApi().Admins.getAdminsInfo(
        body,
        undefined,
        offset,
        limit,
      );
      if (isError(data)) {
        return { isError: true, error: data };
      }
      return { isError: false, admins: data };
    } catch (e) {
      return { isError: true, error: e as IError };
    }
  },
  ['oneentry-admins-info'],
  { revalidate: 300, tags: ['oneentry', 'oneentry-admins'] },
);

/**
 * Get administrators information from the API
 *
 * This function fetches administrator information from the OneEntry API based on the provided parameters.
 * It returns either the administrator data or an error object.
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
}> => await getAdminsInfoImpl(body, offset, limit);
