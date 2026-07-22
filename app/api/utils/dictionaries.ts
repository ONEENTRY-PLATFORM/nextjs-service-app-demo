import 'server-only';

import type { IAttributeValues } from 'oneentry/dist/base/utils';
import { cache } from 'react';

import { getBlockByMarker } from '@/app/api/server/blocks/getBlockByMarker';

/**
 * Get dictionary data from the OneEntry API
 *
 * This function fetches dictionary data (localized content) from the OneEntry API
 * by retrieving the `system_content` block and extracting its attribute values.
 * It is wrapped in React `cache()` so repeated calls within one render are
 * deduplicated; the cross-request TTL cache and the tags for `revalidateTag`
 * live in `getBlockByMarker`.
 *
 * There is deliberately no second `unstable_cache` layer here. `getBlockByMarker`
 * catches transient failures and returns an `{ isError: true }` envelope instead
 * of throwing, so caching its result would serialize that envelope into the data
 * cache and serve the failure for the whole TTL — the poisoned-cache mode
 * `fetchCmsData` exists to prevent. For the same reason there is no try/catch:
 * the call cannot throw, and a missing block degrades to an empty dictionary,
 * which every consumer already handles via its English fallbacks.
 * @returns {Promise<IAttributeValues>} Promise that resolves to dictionary data (empty object when unavailable)
 * @example
 * ```typescript
 * const dictionary = await getDictionary();
 * console.log(dictionary?.welcome_message?.value);
 * ```
 */
export const getDictionary = cache(async (): Promise<IAttributeValues> => {
  /** get block by marker from api */
  const { block } = await getBlockByMarker('system_content');

  /** extract block attribute values */
  const blockValues = block?.attributeValues;

  return { ...(blockValues as IAttributeValues) };
});
