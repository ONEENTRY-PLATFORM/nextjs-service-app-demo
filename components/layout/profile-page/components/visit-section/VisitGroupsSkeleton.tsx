import type { JSX } from 'react';

/**
 * VisitGroupsSkeleton — loading placeholder for the body of one visit-history
 * section. Mirrors VisitGroups exactly (a `w-40` master card on the left, a
 * column of order cards on the right with the same gaps, radii and paddings),
 * so swapping the skeleton for the real list does not shift the layout.
 * @param   {object}      props         - Component props
 * @param   {number}      [props.cards] - How many order-card placeholders to render
 * @returns {JSX.Element}               Skeleton of a master group with order cards
 */
const VisitGroupsSkeleton = ({
  cards = 2,
}: {
  cards?: number;
}): JSX.Element => {
  return (
    <div className="w-full" data-testid="profile-visits-skeleton">
      <div className="mb-5 flex justify-between gap-5 max-md:max-w-full max-md:flex-wrap">
        {/* Master card placeholder */}
        <div className="flex w-40 flex-col self-stretch">
          <div className="aspect-card w-40 animate-pulse self-center rounded-2xl bg-slate-150" />
          <div className="mt-4 h-4 w-28 animate-pulse rounded bg-slate-150" />
          <div className="mt-2 h-3 w-20 animate-pulse rounded bg-slate-150" />
          <div className="my-2 h-4 w-24 animate-pulse rounded bg-slate-150" />
        </div>

        {/* Order card placeholders */}
        <div className="mb-4 flex w-[calc(100%-160px)] flex-col gap-3 max-md:w-full">
          {Array.from({ length: cards }).map((_card, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-2xl border border-slate-150 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
            >
              <div className="flex flex-col gap-2">
                {/* Salon title / address lines */}
                <div className="h-3 w-40 animate-pulse rounded bg-slate-150" />
                <div className="h-3 w-56 max-w-full animate-pulse rounded bg-slate-150" />

                {/* Gradient divider — same as the real card */}
                <div
                  className="h-px w-full"
                  style={{
                    background: 'linear-gradient(90deg,#ed21f144,transparent)',
                  }}
                />

                {/* Service line + date/time line */}
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-150" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-150" />
              </div>

              {/* Buttons group placeholder */}
              <div className="flex gap-3">
                <div className="h-9 w-28 animate-pulse rounded-full bg-slate-150" />
                <div className="h-9 w-28 animate-pulse rounded-full bg-slate-150" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisitGroupsSkeleton;
