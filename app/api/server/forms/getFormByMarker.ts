import type { IError } from 'oneentry/dist/base/utils';
import type { IFormsEntity } from 'oneentry/dist/forms/formsInterfaces';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';

/**
 * Get form by marker.
 * @param   {string}          marker - Menu marker
 * @returns {Promise<object>}        a single form object
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getFormByMarker = async (
  marker: string,
): Promise<{
  isError: boolean;
  error?: IError;
  form?: IFormsEntity;
}> => {
  try {
    const data = await getApi().Forms.getFormByMarker(marker);

    if (isError(data)) {
      return { isError: true, error: data };
    }
    return { isError: false, form: data };
  } catch (e) {
    return { isError: true, error: e as IError };
  }
};
