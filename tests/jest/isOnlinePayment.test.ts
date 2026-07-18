import { isOnlinePayment } from '@/app/api/utils/isOnlinePayment';

describe('isOnlinePayment', () => {
  it('is true for a gateway account on the whitelist', () => {
    expect(isOnlinePayment('stripe')).toBe(true);
  });

  it('is false for the offline "cash" account', () => {
    expect(isOnlinePayment('cash')).toBe(false);
  });

  it('is false for an unknown account (whitelist, not blacklist)', () => {
    // A blacklist would push a future offline provider through createSession
    expect(isOnlinePayment('bank_transfer')).toBe(false);
  });

  it('is false for a missing account identifier', () => {
    expect(isOnlinePayment(undefined)).toBe(false);
    expect(isOnlinePayment('')).toBe(false);
  });
});
