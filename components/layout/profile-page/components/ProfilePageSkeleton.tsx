import type { JSX } from 'react';

import VisitHistorySkeleton from './visit-section/VisitHistorySkeleton';

/**
 * ProfilePageSkeleton — loading placeholder for the whole `/profile` route.
 *
 * Mirrors the page shell rendered on the server (`app/profile/page.tsx`):
 * the gradient hero strip and the `max-w-360` section, then the client
 * layout's 40/60 grid (`ProfileCard` + visit history). The card side is a
 * static placeholder (header row, avatar + name, form fields) and the history
 * side reuses `VisitHistorySkeleton`, so replacing the skeleton with the real
 * page does not shift the layout.
 * @returns {JSX.Element} Profile page skeleton
 */
const ProfilePageSkeleton = (): JSX.Element => {
  return (
    <div data-testid="profile-skeleton">
      {/* Gradient hero strip — same classes/height as `GradientLine`'s default */}
      <div className="h-12.5 bg-gradient-1 xl:h-22.5 sm:h-15 lg:h-20 2xl:h-25" />

      <section className="relative mx-auto flex w-full max-w-360 shrink-0 grow flex-col self-stretch p-5">
        <div className="flex w-full max-w-350 flex-col max-md:max-w-full">
          <div className="my-10">
            {/* 40 / 60 split — identical grid to the rendered page */}
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
              {/* Profile card placeholder */}
              <div
                className="rounded-2xl bg-white p-6 lg:col-span-2"
                style={{ boxShadow: '0 4px 24px rgba(237,33,241,0.08)' }}
              >
                {/* Header row: title + sign out */}
                <div className="mb-5 flex items-center justify-between">
                  <div className="h-5 w-28 animate-pulse rounded bg-slate-150" />
                  <div className="h-8 w-24 animate-pulse rounded-full bg-slate-150" />
                </div>

                {/* Avatar + name */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="size-14 animate-pulse rounded-full bg-slate-150" />
                  <div className="h-4 w-32 animate-pulse rounded bg-slate-150" />
                </div>

                {/* Form field placeholders */}
                <div className="flex flex-col gap-4">
                  {Array.from({ length: 4 }).map((_field, index) => (
                    <div key={index} className="flex flex-col gap-2">
                      <div className="h-3 w-20 animate-pulse rounded bg-slate-150" />
                      <div className="h-11 w-full animate-pulse rounded-xl bg-slate-150" />
                    </div>
                  ))}
                  <div className="mt-2 h-11 w-full animate-pulse rounded-full bg-slate-150" />
                </div>
              </div>

              {/* Visit history placeholder */}
              <div
                className="relative box-border flex shrink-0 flex-col rounded-2xl bg-white p-6 lg:col-span-3"
                style={{ boxShadow: '0 4px 24px rgba(237,33,241,0.08)' }}
              >
                <div className="mb-5 h-5 w-40 animate-pulse rounded bg-slate-150" />
                <VisitHistorySkeleton />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePageSkeleton;
