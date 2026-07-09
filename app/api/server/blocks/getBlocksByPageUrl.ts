import type { IError } from 'oneentry/dist/base/utils';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';

/**
 * Get blocks linked to a given page URL (marker).
 * @param   {object}          args         - Argument object
 * @param   {string}          args.pageUrl - Page marker (not a Next.js route path)
 * @returns {Promise<object>}              Object containing the blocks array or error
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getBlocksByPageUrl = async ({
  pageUrl,
}: {
  pageUrl: string;
}): Promise<{
  isError: boolean;
  error?: IError;
  blocks?: IBlockEntity[];
}> => {
  try {
    const data = await getApi().Pages.getBlocksByPageUrl(pageUrl);
    if (isError(data)) {
      return { isError: true, error: data };
    }
    return { isError: false, blocks: data };
  } catch (e) {
    return { isError: true, error: e as IError };
  }
};
