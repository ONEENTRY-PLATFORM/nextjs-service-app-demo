import type { IError } from 'oneentry/dist/base/utils';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';

import { getApi } from '@/app/api';
import { isError as isSdkError } from '@/app/api';

/**
 * Get block by marker from the OneEntry API
 *
 * This function fetches a block entity by its marker from the OneEntry API.
 * Blocks are used to manage content sections in the application.
 * @param   {string}          marker - Marker of the Block to fetch
 * @returns {Promise<object>}        Promise that resolves to an object containing the block data or error information
 * @see {@link https://oneentry.cloud/instructions/npm|OneEntry docs}
 * @example
 * ```typescript
 * const { isError, block, error } = await getBlockByMarker('hero_section');
 *
 * if (!isError && block) {
 *   console.log('Block:', block);
 * } else {
 *   console.error('Error fetching block:', error);
 * }
 * ```
 */
export const getBlockByMarker = async (
  marker: string,
): Promise<{
  isError: boolean;
  error?: IError;
  block?: IBlockEntity;
}> => {
  try {
    const data = await getApi().Blocks.getBlockByMarker(marker);

    if (isSdkError(data)) {
      return { isError: true, error: data };
    }
    return { isError: false, block: data };
  } catch (e) {
    return { isError: true, error: e as IError };
  }
};
