import type { IOrderByMarkerEntity } from 'oneentry/types';

import { formatUtcDate } from '@/components/layout/profile-page/utils/formatUtcDate';
import { formatUtcTime } from '@/components/layout/profile-page/utils/formatUtcTime';
import { parseOrderInterval } from '@/components/layout/profile-page/utils/parseOrderInterval';

/**
 * Minimal order stub — only `formData` matters to the parser.
 * @param   {unknown}              value    - Raw value of the `interval` field
 * @param   {string}               [marker] - Field marker to write it under
 * @returns {IOrderByMarkerEntity}          Order stub
 */
const order = (value: unknown, marker = 'interval'): IOrderByMarkerEntity =>
  ({ formData: [{ marker, value }] }) as unknown as IOrderByMarkerEntity;

const START = '2026-08-14T14:00:00.000Z';
const END = '2026-08-14T16:50:00.000Z';

describe('parseOrderInterval', () => {
  it('reads the nested wire shape the CMS writes', () => {
    const { start, end } = parseOrderInterval(order([[START, END]]));
    expect(start?.toISOString()).toBe(START);
    expect(end?.toISOString()).toBe(END);
  });

  it('reads a already-flat interval too', () => {
    const { start, end } = parseOrderInterval(order([START, END]));
    expect(start?.toISOString()).toBe(START);
    expect(end?.toISOString()).toBe(END);
  });

  it('returns a start without an end when only one timestamp is stored', () => {
    const { start, end } = parseOrderInterval(order([[START]]));
    expect(start?.toISOString()).toBe(START);
    expect(end).toBeNull();
  });

  it('is null on both sides when the field is missing', () => {
    expect(parseOrderInterval(order([[START, END]], 'salon'))).toEqual({
      start: null,
      end: null,
    });
  });

  it('is null on both sides when the value is not an array', () => {
    expect(parseOrderInterval(order('2026-08-14'))).toEqual({
      start: null,
      end: null,
    });
  });

  it('drops unparsable timestamps instead of returning Invalid Date', () => {
    const { start, end } = parseOrderInterval(order([['not-a-date', END]]));
    expect(start).toBeNull();
    expect(end?.toISOString()).toBe(END);
  });

  it('tolerates an order without form data', () => {
    expect(parseOrderInterval(null)).toEqual({ start: null, end: null });
    expect(parseOrderInterval({} as IOrderByMarkerEntity)).toEqual({
      start: null,
      end: null,
    });
  });
});

describe('formatUtcDate / formatUtcTime', () => {
  it('formats in UTC with leading zeros', () => {
    const date = new Date('2026-01-05T09:07:00.000Z');
    expect(formatUtcDate(date)).toBe('05.01.2026');
    expect(formatUtcTime(date)).toBe('09:07');
  });

  it('does not shift the day into the viewer timezone', () => {
    // 23:30 UTC is already "tomorrow" in Dubai (UTC+4) — the date must not move.
    const date = new Date('2026-08-14T23:30:00.000Z');
    expect(formatUtcDate(date)).toBe('14.08.2026');
    expect(formatUtcTime(date)).toBe('23:30');
  });

  it('composes the confirm-dialog line', () => {
    const { start } = parseOrderInterval(order([[START, END]]));
    expect(`${formatUtcDate(start!)} at ${formatUtcTime(start!)}`).toBe(
      '14.08.2026 at 14:00',
    );
  });
});
