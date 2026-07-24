import type { JSX } from 'react';

import ProfilePageSkeleton from '@/components/layout/profile-page/components/ProfilePageSkeleton';

/**
 * Loading skeleton for the profile route.
 *
 * Covers the gap while the server resolves the dictionary, the `profile` page
 * and the masters roster. Mirrors the page shell (gradient strip + section +
 * the 40/60 card/history grid) so replacing it with the content does not shift
 * the layout. The client `ProfilePage` then runs its own auth-gated states
 * (spinner / `AuthError` / `VisitHistorySkeleton`) once mounted.
 * @returns {JSX.Element} loading component.
 */
export default function Loading(): JSX.Element {
  return <ProfilePageSkeleton />;
}
