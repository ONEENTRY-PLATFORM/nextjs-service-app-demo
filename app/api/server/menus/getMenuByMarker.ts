import type { IError } from 'oneentry/dist/base/utils';
import type { IMenusEntity } from 'oneentry/dist/menus/menusInterfaces';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';

/**
 * Get menu by marker.
 * @param   {string}          marker - Menu marker
 * @returns {Promise<object>}        Menu object
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getMenuByMarker = async (
  marker: string,
): Promise<{
  isError: boolean;
  error?: IError;
  menu?: IMenusEntity;
}> => {
  try {
    const data = await getApi().Menus.getMenusByMarker(marker);

    if (isError(data)) {
      return { isError: true, error: data };
    }
    return { isError: false, menu: data };
  } catch (e) {
    return { isError: true, error: e as IError };
  }
};
