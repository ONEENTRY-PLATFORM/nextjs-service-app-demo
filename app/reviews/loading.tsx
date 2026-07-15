import type { JSX } from 'react';

/**
 * Loading skeleton for the reviews route.
 *
 * `/reviews` reads `searchParams` (the master filter), so it is rendered on
 * demand. This mirrors the real shell — gradient strip, the `max-w-7xl`
 * container, a filter block and the `grid-cols-1 md:grid-cols-2` card grid —
 * so replacing it with the content does not shift the layout.
 *
 * Next.js renders `loading.tsx` without props, so it takes none.
 * @returns {JSX.Element} loading component.
 */
export default function Loading(): JSX.Element {
  return (
    <div className="flex w-full flex-col bg-white">
      {/* Gradient accent strip — same as the real page */}
      <div className="h-1.25 bg-gradient-stats" />

      <div className="mx-auto w-full max-w-7xl px-3 md:px-8">
        {/* Heading + master filter placeholder */}
        <div className="flex flex-col items-center gap-5 py-8">
          <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />
          <div className="flex flex-wrap justify-center gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-10 w-28 animate-pulse rounded-full bg-slate-200"
              />
            ))}
          </div>
        </div>

        {/* Review cards — identical grid to the rendered list */}
        <div className="grid grid-cols-1 gap-5 pb-8 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
