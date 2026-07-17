import type { IAttributeValue } from 'oneentry/dist/base/utils';

import daySlots from '@/components/layout/booking-page/daySlots';

/**
 * Build a `timeInterval` attribute anchored to a single day (no recurrence), so
 * the SDK expansion is deterministic: `dates` start = end means the schedule is
 * anchored to that day, and with neither `inEveryWeek` nor `inEveryMonth` it is
 * a plain one-day range.
 * @param   {string}            isoDay - Anchor day, e.g. `2026-07-22`
 * @param   {[number,number][]} hours  - `[startHour, endHour]` pairs of the slots
 * @returns {IAttributeValue}          timeInterval attribute stub
 */
const scheduleFor = (
  isoDay: string,
  hours: [number, number][],
): IAttributeValue =>
  ({
    type: 'timeInterval',
    value: [
      {
        values: [
          {
            id: 'test',
            dates: [`${isoDay}T00:00:00.000Z`, `${isoDay}T00:00:00.000Z`],
            times: hours.map(([from, to]) => [
              { hours: from, minutes: 0 },
              { hours: to, minutes: 0 },
            ]),
            inEveryWeek: false,
            inEveryMonth: false,
          },
        ],
      },
    ],
  }) as unknown as IAttributeValue;

describe('daySlots', () => {
  it('expands a schedule into HH:MM start labels for the day', () => {
    // dateKey is month-0-indexed (as DateTimeStep emits): July = 6
    const schedule = scheduleFor('2026-07-22', [
      [10, 11],
      [11, 12],
      [14, 15],
    ]);
    expect(daySlots(schedule, '2026-6-22')).toEqual([
      '10:00',
      '11:00',
      '14:00',
    ]);
  });

  it('returns [] for a day the schedule does not cover', () => {
    const schedule = scheduleFor('2026-07-22', [[10, 11]]);
    // Ask for a different day — the anchor is 22nd, no recurrence
    expect(daySlots(schedule, '2026-6-23')).toEqual([]);
  });

  it('returns [] when there is no schedule (falls back to the static grid upstream)', () => {
    expect(daySlots(undefined, '2026-6-22')).toEqual([]);
  });

  it('returns [] for a malformed date key rather than throwing', () => {
    const schedule = scheduleFor('2026-07-22', [[10, 11]]);
    expect(daySlots(schedule, '')).toEqual([]);
    expect(daySlots(schedule, 'not-a-date')).toEqual([]);
  });

  it('sorts and de-duplicates slot labels', () => {
    const schedule = scheduleFor('2026-07-22', [
      [14, 15],
      [10, 11],
      [14, 15],
    ]);
    expect(daySlots(schedule, '2026-6-22')).toEqual(['10:00', '14:00']);
  });
});
