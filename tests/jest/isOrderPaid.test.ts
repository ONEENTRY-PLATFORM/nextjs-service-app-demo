import { isOrderPaid } from '@/components/layout/profile-page/utils/isOrderPaid';

describe('isOrderPaid', () => {
  it('trusts only an explicit gateway confirmation', () => {
    expect(isOrderPaid({ isCompleted: true })).toBe(true);
  });

  it('treats an unpaid online order as not paid', () => {
    // The shape a real abandoned/expired Stripe checkout leaves (orders #17/#18)
    expect(isOrderPaid({ isCompleted: false })).toBe(false);
  });

  it('treats the cash null as not paid — cash never settles online', () => {
    expect(isOrderPaid({ isCompleted: null })).toBe(false);
  });

  it('never turns a missing order into a refund offer', () => {
    expect(isOrderPaid(undefined)).toBe(false);
  });
});
