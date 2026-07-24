import parseOpeningTime from '@/components/utils/parseOpeningTime';
import summarizeOpeningHours from '@/components/utils/summarizeOpeningHours';

/**
 * Build one `timeInterval` weekday group as the CMS returns it: an ISO
 * midnight-UTC date identifying the weekday plus its time pairs.
 * @param   {string} date    - Midnight-UTC ISO date of the weekday
 * @param   {Array}  [times] - Time pairs (`[[{hours,minutes}, {hours,minutes}]]`)
 * @returns {object}         Interval group stub
 */
const makeGroup = (
  date: string,
  times: Array<Array<{ hours: number; minutes: number }>> = [
    [
      { hours: 10, minutes: 0 },
      { hours: 22, minutes: 0 },
    ],
  ],
): unknown => ({
  intervalId: `i-${date}`,
  values: [{ id: `v-${date}`, dates: [date, date], times, inEveryWeek: true }],
});

/** 2026-07-20 is a Monday, so the week runs 20th (Mon) … 26th (Sun). */
const FULL_WEEK = [
  '2026-07-20T00:00:00.000Z',
  '2026-07-21T00:00:00.000Z',
  '2026-07-22T00:00:00.000Z',
  '2026-07-23T00:00:00.000Z',
  '2026-07-24T00:00:00.000Z',
  '2026-07-25T00:00:00.000Z',
  '2026-07-26T00:00:00.000Z',
].map((date) => makeGroup(date));

describe('parseOpeningTime', () => {
  it('orders the CMS week Monday first and formats the hours', () => {
    const rows = parseOpeningTime(FULL_WEEK);

    expect(rows.map((row) => row.day)).toEqual([
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ]);
    expect(rows.every((row) => row.hours === '10:00 – 22:00')).toBe(true);
  });

  it('keeps Sunday last even when the CMS lists it first', () => {
    const sundayFirst = [
      makeGroup('2026-07-26T00:00:00.000Z'),
      makeGroup('2026-07-20T00:00:00.000Z'),
    ];

    expect(parseOpeningTime(sundayFirst).map((row) => row.day)).toEqual([
      'Monday',
      'Sunday',
    ]);
  });

  it('pads times, joins split shifts and marks empty days as closed', () => {
    const rows = parseOpeningTime([
      makeGroup('2026-07-20T00:00:00.000Z', [
        [
          { hours: 9, minutes: 30 },
          { hours: 13, minutes: 0 },
        ],
        [
          { hours: 14, minutes: 0 },
          { hours: 18, minutes: 5 },
        ],
      ]),
      makeGroup('2026-07-21T00:00:00.000Z', []),
    ]);

    expect(rows).toEqual([
      { day: 'Monday', hours: '09:30 – 13:00, 14:00 – 18:05' },
      { day: 'Tuesday', hours: 'Closed' },
    ]);
  });

  it('returns an empty list for a missing or malformed block value', () => {
    expect(parseOpeningTime(undefined)).toEqual([]);
    expect(parseOpeningTime([])).toEqual([]);
    expect(parseOpeningTime('10:00')).toEqual([]);
    expect(parseOpeningTime([{ values: [{ dates: ['nonsense'] }] }])).toEqual(
      [],
    );
  });
});

describe('summarizeOpeningHours', () => {
  it('collapses a uniform week into its first and last weekday', () => {
    expect(summarizeOpeningHours(parseOpeningTime(FULL_WEEK))).toEqual({
      from: 'Monday',
      to: 'Sunday',
      hours: '10:00 – 22:00',
    });
  });

  it('refuses to collapse when the days differ', () => {
    const mixed = parseOpeningTime([
      makeGroup('2026-07-20T00:00:00.000Z'),
      makeGroup('2026-07-21T00:00:00.000Z', []),
    ]);

    expect(summarizeOpeningHours(mixed)).toBeNull();
  });

  it('returns null for an empty week', () => {
    expect(summarizeOpeningHours([])).toBeNull();
  });
});
