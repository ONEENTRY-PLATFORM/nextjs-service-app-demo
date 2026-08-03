import 'server-only';

import type { IAttributesSetsEntity } from 'oneentry/dist/attribute-sets/attributeSetsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import { cache } from 'react';

import { getApi } from '@/app/api/api/api';
import { createCachedCmsReader } from '@/app/api/utils/createCachedCmsReader';

/**
 * Cross-request cached read of the `system_content` attribute set's attributes.
 *
 * `getAttributesByMarker` returns the set's attributes (`IAttributesSetsEntity`,
 * the type the SDK declares since 1.0.158 — not the attribute *set*) with their
 * per-attribute default value (`initialValue`) already delocalized to the SDK
 * `langCode`. That `initialValue` is exactly the field a content editor fills in
 * the admin's attribute-set editor, so it is the single source of truth for the
 * dictionary.
 *
 * The reader never throws (see `createCachedCmsReader`): a transient failure
 * degrades for the current request only instead of poisoning the cache.
 */
const readSystemContentAttributes = createCachedCmsReader<
  [],
  IAttributesSetsEntity[]
>({
  cacheKey: 'oneentry-system-content-attributes',
  label: 'getAttributesByMarker(system_content)',
  revalidate: 60,
  tags: ['oneentry', 'oneentry-dictionary'],
  call: () => getApi().AttributesSets.getAttributesByMarker('system_content'),
});

/**
 * Get dictionary data from the OneEntry API.
 *
 * The UI-text dictionary lives as the per-attribute default value
 * (`initialValue`) of the `system_content` attribute set — the values a content
 * editor edits in the admin's attribute-set editor. This reads them publicly via
 * `getAttributesByMarker` and maps each attribute to the `{ marker: { value } }`
 * shape every consumer already reads through `dict?.<marker>?.value`.
 *
 * Wrapped in React `cache()` so repeated calls within one render are deduplicated;
 * the cross-request TTL cache and `revalidateTag` tags live in the reader above.
 *
 * It deliberately never throws and has no try/catch: the reader cannot throw, and
 * a missing set / transient failure degrades to an empty dictionary, which every
 * consumer already handles via its English fallbacks (`dict?.x?.value || 'Text'`).
 *
 * NOTE: values must NOT contain `{`/`}` — OneEntry's public API 500s on a JSON
 * cast of such a value. Templated markers use `%token%` placeholders instead.
 * @returns {Promise<IAttributeValues>} Promise that resolves to dictionary data (empty object when unavailable)
 * @example
 * ```typescript
 * const dictionary = await getDictionary();
 * console.log(dictionary?.welcome_message?.value);
 * ```
 */
export const getDictionary = cache(async (): Promise<IAttributeValues> => {
  const { data } = await readSystemContentAttributes();
  const attrs = Array.isArray(data) ? data : [];

  /** Map marker → { value } so consumers keep reading `dict?.<marker>?.value`. */
  return Object.fromEntries(
    attrs
      .filter((attr) => Boolean(attr.marker))
      .map((attr) => [attr.marker, { value: attr.initialValue ?? undefined }]),
  ) as IAttributeValues;
});
