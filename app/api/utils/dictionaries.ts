import 'server-only';

import { unstable_cache } from 'next/cache';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import { cache } from 'react';

import { getBlockByMarker } from '@/app/api/server/blocks/getBlockByMarker';

/**
 * Cross-request cache for the `system_content` block (private helper).
 *
 * The dictionary is read on every page, so it is cached between requests with a
 * TTL instead of an unbounded in-memory map — otherwise UI-text edits made in
 * the admin panel would never appear until the server restarts. The tags allow
 * targeted `revalidateTag` invalidation once a CMS webhook exists.
 */
const getSystemContentBlock = unstable_cache(
  async () => await getBlockByMarker('system_content'),
  ['oneentry-dictionary'],
  { revalidate: 300, tags: ['oneentry', 'oneentry-blocks'] },
);

/**
 * Get dictionary data from the OneEntry API
 *
 * This function fetches dictionary data (localized content) from the OneEntry API
 * by retrieving the `system_content` block and extracting its attribute values.
 * It is wrapped in React `cache()` so repeated calls within one render are
 * deduplicated, and reads through a TTL cache shared across requests.
 * @returns {Promise<IAttributeValues>} Promise that resolves to dictionary data (empty object on error)
 * @example
 * ```typescript
 * const dictionary = await getDictionary();
 * console.log(dictionary?.welcome_message?.value);
 * ```
 */
export const getDictionary = cache(async (): Promise<IAttributeValues> => {
  try {
    /** get block by marker from api */
    const { block } = await getSystemContentBlock();

    /** extract block attribute values */
    const blockValues = block?.attributeValues;

    return { ...(blockValues as IAttributeValues) };
  } catch {
    /** Silent degradation: an unavailable dictionary must not break rendering. */
    return {} as IAttributeValues;
  }
});
