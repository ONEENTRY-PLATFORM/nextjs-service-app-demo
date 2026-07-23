'use client';

import type { IAttributeValues } from 'oneentry/dist/base/utils';
import { createContext } from 'react';

/**
 * Client-side dictionary context.
 *
 * Holds the `system_content` UI-text dictionary (`IAttributeValues`, keyed by
 * marker) so client components can read localized copy without threading a
 * `dict` prop through every level. The value is supplied by {@link DictProvider}
 * (wired once in the root layout from the same server-fetched dictionary the
 * server components read via `ServerProvider('dict')`).
 *
 * The default is an empty object: a consumer mounted outside the provider — or
 * a page rendered while the CMS is unavailable — simply falls back to the
 * English literals baked into each call site (`dict?.marker?.value || 'Text'`).
 */
export const DictContext = createContext<IAttributeValues>({});
