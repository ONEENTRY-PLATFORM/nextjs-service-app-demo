import type { JSX } from 'react';

import MasterLoader from '@/components/layout/master-single/components/MasterLoader';
import PortfolioGridLoader from '@/components/layout/portfolio-grid/components/PortfolioGridLoader';

/**
 * Loading skeleton for the master profile route.
 *
 * `/masters/[handle]` reads `searchParams`, so it is rendered on demand: without
 * this file the browser sits on the specialists list until the server has
 * resolved the dictionary and the admins roster. Reuses the very skeletons the
 * page already streams into its own `<Suspense>` boundaries, so the shell shown
 * during navigation matches what replaces it — no layout shift, no double
 * maintenance.
 * @returns {JSX.Element} Master profile skeleton
 */
export default function Loading(): JSX.Element {
  return (
    <>
      <MasterLoader />
      <PortfolioGridLoader />
    </>
  );
}
