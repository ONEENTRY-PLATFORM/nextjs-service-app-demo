import { isError } from '@/app/api/api/api';

import type { SdkQueryResult } from './sdkQueryResult';
import { sdkShapeError } from './sdkShapeError';

/**
 * expectSdkEntity — narrow a "single entity" SDK response for an RTK Query
 * `queryFn`, without the cast that used to hide a broken payload.
 *
 * The SDK runs in shell mode (`isShell: true`, its default, see `api.ts`), so a
 * DNS failure, a dropped socket or an empty `200` body does **not** throw:
 * `browserResponse` returns the caught error as if it were data and
 * `_normalizeData` flattens it into a bare `{}` (an `Error`'s own properties are
 * non-enumerable). `isError` only looks for a numeric `statusCode`, so that `{}`
 * passed straight through `return { data: result as IEntity }` and the crash
 * surfaced later, in a component reading a field the object never had — the
 * `TypeError: e.filter is not a function` seen on `/booking` when the CMS host
 * briefly stopped resolving.
 *
 * A real entity always carries its identifying key (`id`, `pageUrl`, `marker`,
 * …), which `{}` cannot fake; anything else becomes a `502` the hook reports
 * through its normal error branch.
 * @param   {unknown}           result      - Raw value returned by the SDK call
 * @param   {string}            source      - SDK method name, for the error message
 * @param   {string}            requiredKey - Key every real instance carries (defaults to `'id'`)
 * @returns {SdkQueryResult<T>}             `{ data }` for a real entity, `{ error }` otherwise
 */
export const expectSdkEntity = <T extends object>(
  result: unknown,
  source: string,
  requiredKey = 'id',
): SdkQueryResult<T> => {
  if (isError(result)) {
    return { error: result };
  }
  if (
    typeof result === 'object' &&
    result !== null &&
    !Array.isArray(result) &&
    requiredKey in result
  ) {
    return { data: result as T };
  }
  return {
    error: sdkShapeError(source, `a payload with "${requiredKey}"`, result),
  };
};
