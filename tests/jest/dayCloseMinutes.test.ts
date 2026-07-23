import type { IAttributeValue } from 'oneentry/dist/base/utils';

import dayCloseMinutes from '@/components/layout/booking-page/utils/dayCloseMinutes';

/**
 * Build a `timeInterval` attribute anchored to a single day (no recurrence), so
 * the SDK expansion is deterministic — same stub as the `daySlots` test.
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

describe('dayCloseMinutes', () => {
  it('returns the end of the last interval of the day', () => {
    // dateKey is month-0-indexed (as DateTimeStep emits): July = 6
    const schedule = scheduleFor('2026-07-22', [
      [10, 11],
      [20, 21],
      [21, 22],
    ]);
    expect(dayCloseMinutes(schedule, '2026-6-22')).toBe(22 * 60);
  });

  it('returns null for a day the schedule does not cover', () => {
    const schedule = scheduleFor('2026-07-22', [[10, 11]]);
    expect(dayCloseMinutes(schedule, '2026-6-23')).toBeNull();
  });

  it('returns null without a schedule or for a malformed date key', () => {
    expect(dayCloseMinutes(undefined, '2026-6-22')).toBeNull();
    expect(
      dayCloseMinutes(scheduleFor('2026-07-22', [[10, 11]]), ''),
    ).toBeNull();
  });
});
