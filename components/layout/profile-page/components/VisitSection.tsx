'use client';

import { ChevronDown } from 'lucide-react';
import type { JSX, ReactNode } from 'react';
import { useState } from 'react';

import VisitOpenContext from '../animations/VisitOpenContext';

/** Visit bucket statuses and their accent (dot / badge) colors. */
const DOT_COLOR = {
  upcoming: '#ed21f1',
  completed: '#109AA9',
  canceled: '#a8a9b5',
} as const;

/**
 * VisitSection renders one always-visible, collapsible accordion group of the
 * visit history (Upcoming / Completed / Canceled). The header shows a colored
 * status dot, the title, a count badge, and a chevron that rotates when open.
 * @param   {object}                                props               - Component props
 * @param   {string}                                props.title         - Section title
 * @param   {'upcoming' | 'completed' | 'canceled'} props.status        - Bucket status (drives the accent color)
 * @param   {number}                                props.count         - Number of items in the section (shown in the badge)
 * @param   {boolean}                               [props.defaultOpen] - Whether the section starts expanded
 * @param   {ReactNode}                             props.children      - Section body (rendered when open)
 * @returns {JSX.Element}                                               Collapsible section element
 */
const VisitSection = ({
  title,
  status,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  status: 'upcoming' | 'completed' | 'canceled';
  count: number;
  defaultOpen?: boolean | undefined;
  children: ReactNode;
}): JSX.Element => {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const dotColor = DOT_COLOR[status];

  return (
    <div data-testid={`profile-visits-${status}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 py-2"
      >
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ background: dotColor }}
        />
        <span className="flex-1 text-left text-base font-semibold text-slate-400">
          {title}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-xs"
          style={{ background: `${dotColor}18`, color: dotColor }}
        >
          {count}
        </span>
        <ChevronDown
          size={16}
          className="text-neutral-300 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* Smooth collapse via the grid-template-rows 0fr→1fr technique. */}
      <div
        className="grid transition-all duration-200"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          {/* Cards inside read `open` to play their own enter/exit on toggle */}
          <VisitOpenContext.Provider value={open}>
            <div className="pt-2 pb-4">{children}</div>
          </VisitOpenContext.Provider>
        </div>
      </div>
    </div>
  );
};

export default VisitSection;
