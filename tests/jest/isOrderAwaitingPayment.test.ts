import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';

import { isOrderAwaitingPayment } from '@/app/api/utils/isOrderAwaitingPayment';

/**
 * Build an order stub with only the three fields the predicate reads.
 *
 * The full `IOrderByMarkerEntity` carries a dozen unrelated fields; the cast
 * keeps the table below readable.
 * @param   {Partial<IOrderByMarkerEntity>} order - Fields under test
 * @returns {IOrderByMarkerEntity}                Order stub
 */
const orderWith = (
  order: Partial<IOrderByMarkerEntity>,
): IOrderByMarkerEntity => order as IOrderByMarkerEntity;

describe('isOrderAwaitingPayment', () => {
  describe('online (stripe) orders', () => {
    it.each([
      ['false (unpaid stripe)', false],
      ['null (never tracked)', null],
      ['undefined (create response)', undefined],
    ])('awaits payment while isCompleted is %s', (_label, isCompleted) => {
      expect(
        isOrderAwaitingPayment(
          orderWith({
            paymentAccountIdentifier: 'stripe',
            isCompleted: isCompleted as boolean,
            statusIdentifier: 'upcoming',
          }),
        ),
      ).toBe(true);
    });

    it('is settled once the gateway reports isCompleted === true', () => {
      expect(
        isOrderAwaitingPayment(
          orderWith({
            paymentAccountIdentifier: 'stripe',
            isCompleted: true,
            statusIdentifier: 'upcoming',
          }),
        ),
      ).toBe(false);
    });

    it('never offers a checkout link on a cancelled visit', () => {
      expect(
        isOrderAwaitingPayment(
          orderWith({
            paymentAccountIdentifier: 'stripe',
            isCompleted: false,
            statusIdentifier: 'canceled',
          }),
        ),
      ).toBe(false);
    });
  });

  describe('offline and unknown accounts', () => {
    it('cash is settled at the salon — nothing to pay online', () => {
      expect(
        isOrderAwaitingPayment(
          orderWith({
            paymentAccountIdentifier: 'cash',
            isCompleted: null as unknown as boolean,
            statusIdentifier: 'upcoming',
          }),
        ),
      ).toBe(false);
    });

    it('an unknown provider is NOT treated as online (whitelist, not !== cash)', () => {
      expect(
        isOrderAwaitingPayment(
          orderWith({
            paymentAccountIdentifier: 'bank_transfer',
            isCompleted: false,
            statusIdentifier: 'upcoming',
          }),
        ),
      ).toBe(false);
    });

    it('a missing account identifier means no online payment either', () => {
      expect(
        isOrderAwaitingPayment(
          orderWith({ isCompleted: false, statusIdentifier: 'upcoming' }),
        ),
      ).toBe(false);
    });
  });
});
