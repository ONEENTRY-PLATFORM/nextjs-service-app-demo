import { formatOrderTotal } from '@/components/layout/profile-page/utils/formatOrderTotal';

describe('formatOrderTotal', () => {
  it('keeps a round sum round, matching the catalog integer prices', () => {
    expect(formatOrderTotal('370')).toBe('370');
    expect(formatOrderTotal('0')).toBe('0');
  });

  it('pins fractional sums to two decimals', () => {
    expect(formatOrderTotal('370.5')).toBe('370.50');
    expect(formatOrderTotal('99.999')).toBe('100.00');
  });

  it('returns null when there is nothing to show', () => {
    expect(formatOrderTotal(undefined)).toBeNull();
    expect(formatOrderTotal('')).toBeNull();
  });

  it('returns null for an unparsable sum so the card drops the line', () => {
    expect(formatOrderTotal('AED 370')).toBeNull();
    expect(formatOrderTotal('NaN')).toBeNull();
  });
});
