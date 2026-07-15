import type { JSX } from 'react';

import GalleryPageSkeleton from '@/components/layout/gallery-page/components/GalleryPageSkeleton';

/**
 * Loading skeleton for the gallery route.
 *
 * `/gallery` reads `searchParams`, so it is rendered on demand — this skeleton
 * fills the gap instead of leaving the previous page frozen during navigation.
 * @returns {JSX.Element} loading component.
 */
export default function Loading(): JSX.Element {
  return <GalleryPageSkeleton />;
}
