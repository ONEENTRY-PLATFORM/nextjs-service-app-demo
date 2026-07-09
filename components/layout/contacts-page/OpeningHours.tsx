'use client';

import type { JSX } from 'react';
import { useSyncExternalStore } from 'react';

import { openingHoursData } from '@/components/data';
import SectionHeading from '@/components/shared/SectionHeading';

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
 * "Today" on desktop. The schedule comes from `components/data.js` until the
 * `opening_time` block is filled in the CMS.
 * @returns {JSX.Element} Opening hours section
 */
const OpeningHours = (): JSX.Element => {
  /** -1 on the server, the real weekday after hydration — no SSR mismatch */
  const todayIdx = useSyncExternalStore(subscribeNever, getTodayIdx, () => -1);

  return (
    <section className="bg-slate-50 py-6 md:py-10">
      <div className="mx-auto max-w-7xl px-3 md:px-8">
        <div className="mb-6 text-center md:mb-10">
          <SectionHeading size="lg">Opening Hours</SectionHeading>
        </div>

        {/* Mobile + tablet: a single card for the whole week */}
        <div className="lg:hidden">
          <div
            className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-brand p-5 text-center"
            style={{ boxShadow: '0 8px 24px #ed21f144' }}
          >
            <p className="text-sm font-black tracking-wider text-white/80 uppercase">
              Mon – Sun
            </p>
            <p className="text-base font-bold text-white">10:00 – 22:00</p>
          </div>
        </div>

        {/* Desktop: per-day cards with the highlighted today */}
        <div className="hidden gap-3 lg:grid lg:grid-cols-7">
          {openingHoursData.map((row, i) => {
            const isToday = i === todayIdx;
            return (
              <div
                key={row.day}
                className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition-all duration-300 ${
                  isToday
                    ? 'scale-105 bg-gradient-brand'
                    : 'border-[1.5px] border-slate-150 bg-white'
                }`}
                style={{
                  boxShadow: isToday
                    ? '0 8px 24px #ed21f144'
                    : '0 2px 12px rgba(0,0,0,0.05)',
                }}
              >
                <p
                  className={`text-xs font-black tracking-wider uppercase ${
                    isToday ? 'text-white/75' : 'text-neutral-300'
                  }`}
                >
                  {row.day.slice(0, 3)}
                </p>
                <p
                  className={`text-base leading-tight font-normal whitespace-nowrap ${
                    isToday ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {row.hours}
                </p>
                {isToday && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-black tracking-widest text-white uppercase"
                    style={{ background: 'rgba(255,255,255,0.25)' }}
                  >
                    Today
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OpeningHours;
