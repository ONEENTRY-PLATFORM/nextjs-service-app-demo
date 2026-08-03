/**
 * Unit tests for resolveOrderPaymentUrl — the checkout-link resolver of the
 * payment flow (reuse a live `waiting` session before creating a new one).
 *
 * The SDK layer is mocked at the module boundary (same approach as
 * api.test.ts): `getApi` hands back a fake `Payments` module per test, and
 * `isError` keeps the production semantics (numeric `statusCode` = error).
 */
import { getApi } from '@/app/api/api/api';
import { resolveOrderPaymentUrl } from '@/app/api/utils/resolveOrderPaymentUrl';

jest.mock('@/app/api/api/api', () => ({
  getApi: jest.fn(),
  isError: (res: unknown): boolean =>
    typeof (res as { statusCode?: unknown } | undefined)?.statusCode ===
    'number',
}));

const getApiMock = getApi as jest.Mock;

/**
 * Wire the fake Payments module into getApi and hand the spies back.
 * @param   {unknown} sessions - Resolved value of `getSessionByOrderId`
 * @param   {unknown} created  - Resolved value of `createSession`
 * @returns {object}           The two spies — `getSessionByOrderId` and `createSession`
 */
const mockPayments = (sessions: unknown, created?: unknown) => {
  const getSessionByOrderId = jest.fn().mockResolvedValue(sessions);
  const createSession = jest.fn().mockResolvedValue(created);
  getApiMock.mockReturnValue({
    Payments: { getSessionByOrderId, createSession },
  });
  return { getSessionByOrderId, createSession };
};

describe('resolveOrderPaymentUrl', () => {
  beforeEach(() => {
    getApiMock.mockReset();
  });

  it('reuses the waiting session and does not create a new one', async () => {
    const { createSession } = mockPayments([
      { status: 'canceled', paymentUrl: 'https://stripe.test/dead' },
      { status: 'waiting', paymentUrl: 'https://stripe.test/live' },
    ]);

    await expect(resolveOrderPaymentUrl(8)).resolves.toEqual({
      url: 'https://stripe.test/live',
    });
    expect(createSession).not.toHaveBeenCalled();
  });

  it('accepts the documented single-object answer as well as the array', async () => {
    const { createSession } = mockPayments({
      status: 'waiting',
      paymentUrl: 'https://stripe.test/single',
    });

    await expect(resolveOrderPaymentUrl(8)).resolves.toEqual({
      url: 'https://stripe.test/single',
    });
    expect(createSession).not.toHaveBeenCalled();
  });

  it('creates a session when no listed session is reusable', async () => {
    // A dead session and a waiting one without a URL — neither may be reused.
    const { getSessionByOrderId, createSession } = mockPayments(
      [
        { status: 'canceled', paymentUrl: 'https://stripe.test/dead' },
        { status: 'waiting' },
      ],
      { paymentUrl: 'https://stripe.test/new' },
    );

    await expect(resolveOrderPaymentUrl(9)).resolves.toEqual({
      url: 'https://stripe.test/new',
    });
    expect(getSessionByOrderId).toHaveBeenCalledWith(9);
    expect(createSession).toHaveBeenCalledWith(9, 'session');
  });

  it('falls through to createSession when the session listing errors', async () => {
    mockPayments(
      { statusCode: 500, message: 'listing down' },
      { paymentUrl: 'https://stripe.test/recovered' },
    );

    await expect(resolveOrderPaymentUrl(10)).resolves.toEqual({
      url: 'https://stripe.test/recovered',
    });
  });

  it('surfaces the createSession error message', async () => {
    mockPayments([], { statusCode: 400, message: 'no such order' });

    await expect(resolveOrderPaymentUrl(11)).resolves.toEqual({
      error: 'no such order',
    });
  });

  it('reports a session created without a checkout link as an error', async () => {
    mockPayments([], { status: 'waiting' });

    await expect(resolveOrderPaymentUrl(12)).resolves.toEqual({
      error: 'The payment provider did not return a checkout link',
    });
  });
});
