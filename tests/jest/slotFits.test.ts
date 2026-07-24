import type { BookingService } from '@/components/layout/booking-page/types';
import slotFits from '@/components/layout/booking-page/utils/slotFits';
import totalServiceMinutes from '@/components/layout/booking-page/utils/totalServiceMinutes';
import formatMinutes from '@/components/utils/formatMinutes';

/**
 * Minimal `BookingService` stub — only `durationMinutes` matters for the total.
 * The display line is filled from it so the stub cannot drift from a real one.
 * @param   {number | null}  durationMinutes - Duration the CMS carries, `null` when unset
 * @returns {BookingService}                 Service stub
 */
const service = (durationMinutes: number | null): BookingService => ({
  id: 'x',
  category: 'Face',
  name: 'Test',
  duration: durationMinutes !== null ? `${durationMinutes} min` : '',
  durationMinutes,
  price: null,
  currency: '',
  productId: null,
  categoryId: null,
});

/** Studio open until 22:00 */
const CLOSE = 22 * 60;

describe('totalServiceMinutes', () => {
  it('sums the durations', () => {
    expect(totalServiceMinutes([service(30), service(60)])).toBe(90);
  });

  it('counts a service without a duration as 60 min', () => {
    expect(totalServiceMinutes([service(null)])).toBe(60);
  });

  it('is 0 for an empty selection', () => {
    expect(totalServiceMinutes([])).toBe(0);
  });

  /**
   * Regression guard for the trap this field split exists to close: the display
   * line is formatted for humans, and the project's canonical formatter renders
   * 90 as `1 h 30 min`. Parsing that back would yield 1 minute.
   */
  it('ignores the display line, even when it is formatted as hours', () => {
    const ninety: BookingService = {
      ...service(90),
      duration: formatMinutes(90),
    };
    expect(ninety.duration).toBe('1 h 30 min');
    expect(totalServiceMinutes([ninety])).toBe(90);
  });
});

describe('slotFits', () => {
  it('rejects a start whose visit runs past closing', () => {
    // 90 min from 21:00 ends at 22:30 — the studio shuts at 22:00
    expect(slotFits('21:00', 90, CLOSE)).toBe(false);
  });

  it('accepts a start whose visit ends exactly at closing', () => {
    expect(slotFits('20:30', 90, CLOSE)).toBe(true);
    expect(slotFits('20:00', 90, CLOSE)).toBe(true);
  });

  it('accepts everything when nothing is selected yet', () => {
    expect(slotFits('21:00', 0, CLOSE)).toBe(true);
  });

  it('accepts everything when the closing time is unknown', () => {
    expect(slotFits('21:00', 90, null)).toBe(true);
  });
});

describe('formatMinutes', () => {
  it('renders hours and minutes', () => {
    expect(formatMinutes(90)).toBe('1 h 30 min');
    expect(formatMinutes(60)).toBe('1 h');
    expect(formatMinutes(30)).toBe('30 min');
    expect(formatMinutes(0)).toBe('');
  });
});
