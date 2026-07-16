import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IError } from 'oneentry/dist/base/utils';
import type { IFilterParams } from 'oneentry/dist/products/productsInterfaces';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';

/**
 * Get administrators information from the API
 *
 * This function fetches administrator information from the OneEntry API based on the provided parameters.
 * It returns either the administrator data or an error object.
 *
 * NOT wrapped in `unstable_cache`, unlike the other content fetchers: the full
 * roster is ~8.7 MB (32 admins with every attribute — portfolio, services,
 * descriptions) and the data cache rejects entries over 2 MB, so caching it
 * only produced a failed write plus an `unhandledRejection` on every render.
 * Request-level dedupe still comes from `getMastersList`, which wraps this in
 * React `cache()`.
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
};
