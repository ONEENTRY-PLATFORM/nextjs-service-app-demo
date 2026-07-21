import 'server-only';

import { cache } from 'react';

import { getAdminsInfo } from '@/app/api/server/admins/getAdminsInfo';

/**
 * getMastersList — shared, request-deduped fetch of the full masters (admins) list.
 *
 * `getAdminsInfo` already layers React `cache()` over a cross-request
 * `unstable_cache`, but the master route needs the same list in
 * `generateMetadata`, the page body, `MasterSingleLayout` and
 * `PortfolioGridLayout`. This shared thunk keeps the call arguments identical
 * across all of them so they collapse onto that one cached entry.
 * @returns {ReturnType<typeof getAdminsInfo>} Promise resolving to the admins envelope
 */
export const getMastersList = cache(() =>
  getAdminsInfo({ body: [], offset: 0, limit: 100 }),
);
