import { isPaidOrderError } from '@/components/layout/profile-page/utils/isPaidOrderError';

describe('isPaidOrderError', () => {
  it('recognises the real refusal wording of a paid order', () => {
    // Verbatim API answer to a cancel attempt on a paid order.
    expect(
      isPaidOrderError({
        message:
          "Can't update the order. Payment sessions 3 could not be canceled — the order may have been paid.",
      }),
    ).toBe(true);
  });

  it('matches on "paid"/"payment" case-insensitively', () => {
    expect(isPaidOrderError({ message: 'Order already PAID' })).toBe(true);
    expect(isPaidOrderError({ message: 'payment pending' })).toBe(true);
  });

  it('keeps every other refusal on the plain error dialog', () => {
    expect(isPaidOrderError({ message: 'Order not found' })).toBe(false);
    expect(isPaidOrderError({ message: '' })).toBe(false);
  });

  it('never turns a shapeless throw into a refund offer', () => {
    expect(isPaidOrderError(undefined)).toBe(false);
    expect(isPaidOrderError(null)).toBe(false);
    expect(isPaidOrderError('paid')).toBe(false);
    expect(isPaidOrderError({})).toBe(false);
  });
});
