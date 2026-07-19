import { unstable_cache } from 'next/cache';
import type { IError } from 'oneentry/dist/base/utils';
import type { IFormsEntity } from 'oneentry/dist/forms/formsInterfaces';
import { cache } from 'react';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';
import { withTimeout } from '@/app/api/utils/withTimeout';

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
    try {
      const data = await withTimeout(
        getApi().Forms.getFormByMarker(marker),
        10_000,
        'getFormByMarker',
      );

      if (isError(data)) {
        return { isError: true, error: data };
      }
      return { isError: false, form: data };
    } catch (e) {
      return { isError: true, error: e as IError };
    }
  },
  ['oneentry-form-by-marker'],
  { revalidate: 300, tags: ['oneentry', 'oneentry-forms'] },
);

/**
 * Get form by marker.
 *
 * Wrapped in React `cache()` over a cross-request `unstable_cache`.
 * @param   {string}          marker - Menu marker
 * @returns {Promise<object>}        a single form object
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getFormByMarker = cache(getFormByMarkerImpl);
