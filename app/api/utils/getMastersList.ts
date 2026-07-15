import 'server-only';

import { cache } from 'react';

import { getAdminsInfo } from '@/app/api';

/**
 * getMastersList — shared, request-deduped fetch of the full masters (admins) list.
 *
 * `getAdminsInfo` is a POST request, which Next.js does not memoize on its own,
 * while the master route needs the same list in `generateMetadata`, the page
 * body, `MasterSingleLayout` and `PortfolioGridLayout`. React's `cache()`
 * collapses those into a single request per render.
 * @returns {ReturnType<typeof getAdminsInfo>} Promise resolving to the admins envelope
 */
export const getMastersList = cache(() =>
  getAdminsInfo({ body: [], offset: 0, limit: 100 }),
);
