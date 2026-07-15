import 'server-only';

import type { IAttributeValues } from 'oneentry/dist/base/utils';

import { getBlockByMarker } from '@/app/api/';

import getCachedData from './getCachedData';

/**
 * Get dictionary data from the OneEntry API
 *
 * This function fetches dictionary data (localized content) from the OneEntry API
 * using a cached data approach. It retrieves a block by the marker 'system_content'
 * and extracts its attribute values to be used as dictionary entries.
 * @returns {Promise<IAttributeValues>} Promise that resolves to dictionary data (empty object on error)
 * @example
 * ```typescript
 * const dictionary = await getDictionary();
 * console.log(dictionary?.welcome_message?.value);
 * ```
 */
export const getDictionary = async (): Promise<IAttributeValues> => {
  try {
    /** get block by marker from api */
    const { block } = await getCachedData(
      'dictionary',
      async () => await getBlockByMarker('system_content'),
    );

    /** extract block attribute values */
    const blockValues = block?.attributeValues;

    return { ...(blockValues as IAttributeValues) };
  } catch {
    /** Silent degradation: an unavailable dictionary must not break rendering. */
    return {} as IAttributeValues;
  }
};
