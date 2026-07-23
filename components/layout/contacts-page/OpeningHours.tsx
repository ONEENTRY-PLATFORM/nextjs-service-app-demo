'use client';

import type { JSX } from 'react';
import { useSyncExternalStore } from 'react';

import type { OpeningHoursRow } from '@/app/utils/parseOpeningTime';
import summarizeOpeningHours from '@/app/utils/summarizeOpeningHours';
import SectionHeading from '@/components/shared/SectionHeading';

import OpeningHoursDayCard from './OpeningHoursDayCard';

/**
 * No-op subscription — the value only needs a client/server split.
 * @returns {() => void} Unsubscribe callback
 */
const subscribeNever = (): (() => void) => {
  return () => {};
};

/**
 * Monday-based index of today (client snapshot).
 * @returns {number} 0 (Monday) … 6 (Sunday)
 */
const getTodayIdx = (): number => {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
};

/**
 * OpeningHours component — the "Opening Hours" section of the contacts page
 * as in the static-html mock (`ContactsPage.tsx` → OpeningHours): a single
 * Mon–Sun gradient card on mobile/tablet and per-day cards with a highlighted
 * "Today" on desktop. The schedule comes from the CMS `opening_time` block.
 *
 * The mobile card collapses the week into one line only while every day shares
 * the same hours; once they differ it falls back to the per-day list so no day
 * is misrepresented.
 * @param   {object}            props      - Component properties
 * @param   {OpeningHoursRow[]} props.rows - Weekday rows, Monday first
 * @returns {JSX.Element}                  Opening hours section
 */
const OpeningHours = ({ rows }: { rows: OpeningHoursRow[] }): JSX.Element => {
  /** -1 on the server, the real weekday after hydration — no SSR mismatch */
  const todayIdx = useSyncExternalStore(subscribeNever, getTodayIdx, () => -1);

  const summary = summarizeOpeningHours(rows);
  /** Mock notation for the compact card: three-letter days (`Mon – Sun`). */
  const summaryRange =
    summary === null
      ? ''
      : summary.from === summary.to
        ? summary.from.slice(0, 3)
        : `${summary.from.slice(0, 3)} – ${summary.to.slice(0, 3)}`;

  return (
    <section className="bg-slate-50 py-6 md:py-10" data-testid="opening-hours">
      <div className="page-shell">
        <SectionHeading className="mb-6 md:mb-10">Opening Hours</SectionHeading>

        {/* Mobile + tablet: a single card for the whole week */}
        <div className="lg:hidden">
          {summary ? (
            <div
              data-testid="opening-hours-summary"
              className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-brand p-5 text-center"
              style={{ boxShadow: '0 8px 24px #ed21f144' }}
            >
              <p className="text-sm font-black tracking-wider text-white/80 uppercase">
                {summaryRange}
              </p>
              <p className="text-base font-bold text-white">{summary.hours}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {rows.map((row, i) => (
                <OpeningHoursDayCard
                  key={row.day}
                  row={row}
                  isToday={i === todayIdx}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop: per-day cards with the highlighted today */}
        <div className="hidden gap-3 lg:grid lg:grid-cols-7">
          {rows.map((row, i) => (
            <OpeningHoursDayCard
              key={row.day}
              row={row}
              isToday={i === todayIdx}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OpeningHours;
