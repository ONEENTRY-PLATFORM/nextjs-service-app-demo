import type { JSX } from 'react';

import VisitGroupsSkeleton from './VisitGroupsSkeleton';

/** Section accent colors — same palette as VisitSection's status dots. */
const SECTIONS = [
  { color: '#ed21f1', width: 'w-24', open: true },
  { color: '#109AA9', width: 'w-24', open: false },
  { color: '#a8a9b5', width: 'w-20', open: false },
] as const;

/**
 * VisitHistorySkeleton — loading placeholder for the whole visit-history column
 * while the orders request is in flight. Mirrors ProfileHistory (three
 * `divide-y` sections with the same paddings, each with a status dot, a title
 * bar, a count badge and a chevron slot); only the first section is "expanded",
 * matching `defaultOpen` on Upcoming.
 * @returns {JSX.Element} Visit-history skeleton
 */
const VisitHistorySkeleton = (): JSX.Element => {
  return (
    <div
      className="w-full divide-y divide-slate-150"
      data-testid="profile-history-skeleton"
    >
      {SECTIONS.map(({ color, width, open }, index) => (
        <div
          key={index}
          className={index === 0 ? 'pb-4' : index === 1 ? 'py-4' : 'pt-4'}
        >
          {/* Section header placeholder */}
          <div className="flex w-full items-center gap-3 py-2">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ background: color }}
            />
            <span
              className={`h-4 ${width} animate-pulse rounded bg-slate-150`}
            />
            <span className="ml-auto h-5 w-7 animate-pulse rounded-full bg-slate-150" />
            <span className="size-4 animate-pulse rounded bg-slate-150" />
          </div>

          {/* Body — only the first (expanded) section shows content */}
          {open && (
            <div className="pt-2 pb-4">
              <VisitGroupsSkeleton />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default VisitHistorySkeleton;
