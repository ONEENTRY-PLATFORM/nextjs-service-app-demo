import type { IError } from 'oneentry/dist/base/utils';
import type { IFormsEntity } from 'oneentry/dist/forms/formsInterfaces';

import { getApi } from '@/app/api/api/api';
import { createCachedCmsReader } from '@/app/api/utils/createCachedCmsReader';

/** Cached reader: TTL, request-level dedupe and transient-failure handling. */
const readFormByMarker = createCachedCmsReader<[string], IFormsEntity>({
  cacheKey: 'oneentry-form-by-marker',
  label: 'getFormByMarker',
  revalidate: 300,
  tags: ['oneentry', 'oneentry-forms'],
  call: (marker) => getApi().Forms.getFormByMarker(marker),
});

/**
 * Get form by marker.
 *
 * ⚠️ Currently UNUSED — no module imports this wrapper: every form is read client-side through `useGetFormByMarkerQuery`.
 * Kept per project convention; the split between the server wrappers and the
 * RTK Query endpoints was settled in favour of the latter here.
 *
 * Wrapped in React `cache()` over a cross-request `unstable_cache`.
 * @param   {string}          marker - Menu marker
 * @returns {Promise<object>}        a single form object
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getFormByMarker = async (
  marker: string,
): Promise<{ isError: boolean; error?: IError; form?: IFormsEntity }> => {
  const { isError: failed, error, data } = await readFormByMarker(marker);
  return {
    isError: failed,
    ...(error ? { error } : {}),
    ...(data ? { form: data } : {}),
  };
};
