import { isError } from '@/app/api/api/api';

import type { SdkQueryResult } from './sdkQueryResult';
import { sdkShapeError } from './sdkShapeError';

/**
 * expectSdkList — narrow a "list" SDK response for an RTK Query `queryFn`.
 *
 * The array counterpart of `expectSdkEntity`: in shell mode a transient
 * network failure comes back as a flattened `{}` that `isError` does not
 * recognize, and `{ data: result as IEntity[] }` used to pass it on as a list.
 * Every array method then throws on it — `?? []` cannot help, since `{}` is
 * neither `null` nor `undefined`.
 * @param   {unknown}             result - Raw value returned by the SDK call
 * @param   {string}              source - SDK method name, for the error message
 * @returns {SdkQueryResult<T[]>}        `{ data }` for a real array, `{ error }` otherwise
 */
export const expectSdkList = <T>(
  result: unknown,
  source: string,
): SdkQueryResult<T[]> => {
  if (isError(result)) {
    return { error: result };
  }
  if (Array.isArray(result)) {
    return { data: result as T[] };
  }
  return { error: sdkShapeError(source, 'an array', result) };
};
