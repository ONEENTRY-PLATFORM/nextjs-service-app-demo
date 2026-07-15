import type { JSX } from 'react';

/**
 * GalleryPageSkeleton — loading placeholder shared by the gallery routes.
 *
 * Mirrors the real page shell (gradient strip + `GalleryPageContent`): a
 * fixed-height filter bar block and the photo grid with exactly the same
 * grid/gap/padding classes and `aspect-4/5` cells, so swapping the skeleton for
 * the content does not shift the layout.
 * @returns {JSX.Element} Gallery skeleton
 */
const GalleryPageSkeleton = (): JSX.Element => {
  return (
    <div className="flex w-full flex-col bg-white">
      {/* Gradient strip — same as the real page */}
      <div className="h-1.25 bg-gradient-stats" />

      {/* Filter bar placeholder: tabs, category pills and the photo counter */}
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-5 px-3 py-6 md:px-8">
        <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />
        <div className="flex flex-wrap justify-center gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-11 w-24 animate-pulse rounded-full bg-slate-200"
            />
          ))}
        </div>
        <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
      </div>

      {/* Photo grid — identical classes to the rendered gallery grid */}
      <div className="grid grid-cols-2 gap-3 px-3 pb-4 sm:grid-cols-3 md:gap-4 md:px-6 lg:grid-cols-5">
        {Array.from({ length: 15 }).map((_, index) => (
          <div
            key={index}
            className="aspect-4/5 animate-pulse rounded-2xl bg-slate-200"
          />
        ))}
      </div>
    </div>
  );
};

export default GalleryPageSkeleton;
