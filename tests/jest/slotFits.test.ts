import formatMinutes from '@/app/utils/formatMinutes';
import slotFits from '@/components/layout/booking-page/slotFits';
import totalServiceMinutes from '@/components/layout/booking-page/totalServiceMinutes';
import type { BookingService } from '@/components/layout/booking-page/types';

/**
 * Minimal `BookingService` stub — only `duration` matters for the total.
 * @param   {string}         duration - Human duration line, e.g. `60 min`
 * @returns {BookingService}          Service stub
 */
const service = (duration: string): BookingService => ({
  id: 'x',
  category: 'Face',
  name: 'Test',
  duration,
  price: null,
  currency: '',
  productId: null,
  categoryId: null,
});

/** Studio open until 22:00 */
const CLOSE = 22 * 60;

describe('totalServiceMinutes', () => {
  it('sums the parsed durations', () => {
    expect(totalServiceMinutes([service('30 min'), service('60 min')])).toBe(
      90,
    );
  });

  it('counts a service without a duration as 60 min', () => {
    expect(totalServiceMinutes([service('')])).toBe(60);
  });

  it('is 0 for an empty selection', () => {
    expect(totalServiceMinutes([])).toBe(0);
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
