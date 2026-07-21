import { unstable_cache } from 'next/cache';
import type { IError } from 'oneentry/dist/base/utils';
import type { IFormsEntity } from 'oneentry/dist/forms/formsInterfaces';
import { cache } from 'react';

import { getApi, isError } from '@/app/api/api/api';
import { fetchCmsData } from '@/app/api/utils/fetchCmsData';

/**
 * Fetch a form from OneEntry, cached across requests (private helper).
 *
 * Form schemas change rarely (they are edited in the admin panel), so this uses
 * the longer 5-minute TTL rather than the 60s of page/product content.
 * @param   {string}          marker - Form marker
 * @returns {Promise<object>}        Envelope with the form or the error
 */
const getFormByMarkerImpl = unstable_cache(
  async (
    marker: string,
  ): Promise<{
    isError: boolean;
    error?: IError;
    form?: IFormsEntity;
  }> => {
    const data = await fetchCmsData(
      () => getApi().Forms.getFormByMarker(marker),
      'getFormByMarker',
    );
    if (isError(data)) {
      return { isError: true, error: data };
    }
    return { isError: false, form: data };
  },
  ['oneentry-form-by-marker'],
  { revalidate: 300, tags: ['oneentry', 'oneentry-forms'] },
);

/** Request-level dedupe over the cross-request cache. */
const getFormByMarkerCached = cache(getFormByMarkerImpl);

/**
 * Get form by marker.
 *
 * Wrapped in React `cache()` over a cross-request `unstable_cache`.
 * @param   {string}          marker - Menu marker
 * @returns {Promise<object>}        a single form object
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getFormByMarker = async (
  marker: string,
): Promise<{ isError: boolean; error?: IError; form?: IFormsEntity }> => {
  try {
    return await getFormByMarkerCached(marker);
  } catch (e) {
    // Transient CMS failure — not cached by unstable_cache; degrade for this
    // request only instead of caching a poisoned result.
    return { isError: true, error: e as IError };
  }
};
