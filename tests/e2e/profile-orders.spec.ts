import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { hasCreds, signInTestUser } from './fixtures/helpers';

// The signed-in visit history (`ProfileHistory` → `VisitSection` → `VisitGroups`
// → `OrderCard`) and its per-status actions. The order list is served from a
// fixture instead of the CMS: the flows depend on having one order of EVERY
// status (upcoming / completed / canceled), which no live account is guaranteed
// to hold, and cancelling a real appointment would mutate the account. The
// order PUT is intercepted the same way booking-order.spec intercepts the POST,
// so nothing is written back.
//
// SDK URLs (see oneentry/dist/orders/ordersApi): the list is
// `…/api/content/orders-storage/marker/{marker}/orders?…` (GET) and an update
// is the same path plus `/{id}` (PUT).
const ORDERS_LIST_RE = /\/api\/content\/orders-storage\/marker\/[^/]+\/orders/;

/** Payment session endpoints of the SDK (`payments/paymentsApi`). */
const SESSION_BY_ORDER_RE = /\/api\/content\/payments\/sessions\/order\/\d+/;
const CREATE_SESSION_RE = /\/api\/content\/payments\/sessions$/;

/** Fixture order ids: one per status bucket, plus the unpaid online booking. */
const ORDER_ID = {
  upcoming: 900001,
  completed: 900002,
  canceled: 900003,
  unpaid: 900004,
};

/**
 * Build one fixture order for a status bucket.
 *
 * Only the fields the profile actually reads are provided: the status, the
 * booked products (title + duration lookup key), and the `interval` /
 * `master` form fields. `salon` is deliberately omitted — the card's salon
 * lookup is an extra request that adds nothing to the flows under test.
 *
 * The payment half defaults to a settled cash booking, which is what the
 * status flows want; the unpaid-online case passes its own (`stripe` +
 * `isCompleted: false`, the shape a real abandoned Stripe checkout leaves —
 * see `.claude/temp/inspect-order-payment.mjs`).
 * @param   {number}         id                  - Order id
 * @param   {string}         status              - Order status identifier (`upcoming` / `completed` / `canceled`)
 * @param   {string}         statusTitle         - Human-readable status, shown in the badge
 * @param   {object}         [payment]           - Payment account + settlement state of the order
 * @param   {string}         payment.identifier  - Payment account marker (`cash` / `stripe`)
 * @param   {string}         payment.title       - Localized payment account title
 * @param   {boolean | null} payment.isCompleted - Whether the gateway reported the order paid
 * @returns {object}                             Order entity as the orders API returns it
 */
const makeOrder = (
  id: number,
  status: string,
  statusTitle: string,
  payment: {
    identifier: string;
    title: string;
    isCompleted: boolean | null;
  } = { identifier: 'cash', title: 'Cash', isCompleted: null },
): Record<string, unknown> => ({
  id,
  statusIdentifier: status,
  statusLocalizeInfos: { title: statusTitle },
  createdDate: '2026-07-01T10:00:00.000Z',
  formIdentifier: 'order',
  paymentAccountIdentifier: payment.identifier,
  paymentAccountLocalizeInfos: { title: payment.title },
  isCompleted: payment.isCompleted,
  totalSum: '370',
  currency: 'AED',
  products: [{ id: 71, title: 'E2E fixture service', quantity: 1 }],
  formData: [
    { marker: 'master', type: 'entity', value: [0] },
    {
      marker: 'interval',
      type: 'timeInterval',
      value: [['2026-12-15T14:00:00.000Z', '2026-12-15T15:00:00.000Z']],
    },
  ],
});

/** One order per bucket, with a second upcoming one left unpaid on Stripe. */
const FIXTURE_ORDERS = [
  makeOrder(ORDER_ID.upcoming, 'upcoming', 'Upcoming'),
  makeOrder(ORDER_ID.unpaid, 'upcoming', 'Upcoming', {
    identifier: 'stripe',
    title: 'Stripe',
    isCompleted: false,
  }),
  makeOrder(ORDER_ID.completed, 'completed', 'Completed'),
  makeOrder(ORDER_ID.canceled, 'canceled', 'Canceled'),
];

/**
 * Serve the fixture order list and swallow order updates.
 *
 * Everything else (getMe, catalog, masters…) passes through untouched, so the
 * page renders against the live CMS apart from the history itself.
 *
 * The single-order GET (`…/orders/{id}`) matches {@link ORDERS_LIST_RE} too and
 * is answered from the same fixture set: it is the fresh re-read the refund
 * gate makes after a payment-shaped refusal, and letting it fall through to the
 * live CMS would 404 on fixture ids and silently downgrade the flow under test
 * to the stale-list fallback.
 * @param   {Page}                      page                - Playwright page
 * @param   {object}                    [opts]              - Route behaviour overrides
 * @param   {string}                    [opts.updateError]  - Reject updates with this API error message instead of acknowledging them
 * @param   {Record<string, unknown>[]} [opts.orders]       - Serve these orders instead of {@link FIXTURE_ORDERS}
 * @param   {Record<string, unknown>[]} [opts.freshOrders]  - Answer the single-order GET from these instead of `orders` — lets a test diverge the re-read from the cached list (payment landing late, or an empty pool forcing the 404 → cached fallback)
 * @returns {Promise<void>}                                 Resolves once the route is installed
 */
const mockOrders = async (
  page: Page,
  opts: {
    updateError?: string;
    orders?: Record<string, unknown>[];
    freshOrders?: Record<string, unknown>[];
  } = {},
): Promise<void> => {
  const { updateError, orders = FIXTURE_ORDERS, freshOrders = orders } = opts;
  await page.route(ORDERS_LIST_RE, async (route) => {
    const method = route.request().method();
    // `…/marker/{marker}/orders/900001?…` — the trailing id separates the
    // single-order read from the list (the marker segment never is numeric)
    const singleId = route
      .request()
      .url()
      .match(/\/orders\/(\d+)/)?.[1];
    if (method === 'GET' && singleId) {
      const order = freshOrders.find((o) => o.id === Number(singleId));
      await route.fulfill({
        status: order ? 200 : 404,
        contentType: 'application/json',
        body: JSON.stringify(
          order ?? { statusCode: 404, message: 'Order not found' },
        ),
      });
      return;
    }
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: orders,
          total: orders.length,
        }),
      });
      return;
    }
    if (method === 'PUT') {
      if (updateError) {
        // A refused cancellation, in the API's own error envelope
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ statusCode: 400, message: updateError }),
        });
        return;
      }
      // The cancel/save mutations — acknowledge without touching the CMS
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: ORDER_ID.upcoming }),
      });
      return;
    }
    await route.fallback();
  });
};

/**
 * Answer the payment-session endpoints the "Pay" button walks through.
 *
 * The order has no live session (`[]`), so the button always falls through to
 * `createSession` — the branch that decides where the client is sent.
 * @param   {Page}          page           - Playwright page
 * @param   {object}        result         - What `createSession` should answer with
 * @param   {string}        [result.url]   - Checkout URL of the created session
 * @param   {string}        [result.error] - API error message instead of a session
 * @returns {Promise<void>}                Resolves once the routes are installed
 */
const mockPayments = async (
  page: Page,
  result: { url?: string; error?: string },
): Promise<void> => {
  await page.route(SESSION_BY_ORDER_RE, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '[]',
    });
  });
  await page.route(CREATE_SESSION_RE, async (route) => {
    if (result.error) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ statusCode: 400, message: result.error }),
      });
      return;
    }
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        status: 'waiting',
        orderId: ORDER_ID.unpaid,
        paymentUrl: result.url,
      }),
    });
  });
};

/**
 * Sign in with the fixture history in place and open a status bucket.
 * The Upcoming section starts expanded; the other two have to be clicked open.
 * @param   {Page}          page   - Playwright page
 * @param   {string}        status - Bucket to expand (`upcoming` / `completed` / `canceled`)
 * @returns {Promise<void>}        Resolves once the bucket's order card is visible
 */
const openBucket = async (page: Page, status: string): Promise<void> => {
  await mockOrders(page);
  await signInTestUser(page);

  const section = page.getByTestId(`profile-visits-${status}`);
  await expect(section).toBeVisible({ timeout: 30_000 });
  if (status !== 'upcoming') {
    await section.getByRole('button').first().click();
  }
  await expect(section.getByTestId('order-services').first()).toBeVisible({
    timeout: 30_000,
  });
};

test.describe('Profile — visit history', () => {
  // Desktop: the profile renders both columns without the mobile tab switcher
  test.use({ viewport: { width: 1280, height: 900 } });

  test.beforeEach(() => {
    test.skip(!hasCreds(), 'E2E_USER_EMAIL / E2E_USER_PASSWORD not set');
  });

  test('renders the three status buckets with their counts', async ({
    page,
  }) => {
    await mockOrders(page);
    await signInTestUser(page);

    // Two upcoming fixtures (one of them the unpaid online booking), one each
    // in the other buckets
    for (const [status, count] of [
      ['upcoming', '2'],
      ['completed', '1'],
      ['canceled', '1'],
    ] as const) {
      const section = page.getByTestId(`profile-visits-${status}`);
      await expect(section).toBeVisible({ timeout: 30_000 });
      await expect(section.getByRole('button').first()).toContainText(count);
    }

    // Upcoming is the only bucket expanded by default → its card is on screen
    await expect(
      page
        .getByTestId('profile-visits-upcoming')
        .getByTestId('order-services')
        .first(),
    ).toContainText('E2E fixture service');
  });

  test('an upcoming visit offers Reschedule and Cancel booking', async ({
    page,
  }) => {
    await openBucket(page, 'upcoming');

    const section = page.getByTestId('profile-visits-upcoming');
    await expect(section.getByTestId('order-reschedule').first()).toBeVisible();
    await expect(section.getByTestId('order-cancel').first()).toBeVisible();
    // Upcoming visits never offer the completed-only review action
    await expect(section.getByTestId('order-leave-review')).toHaveCount(0);
  });

  test('Reschedule reopens the wizard on that appointment', async ({
    page,
  }) => {
    await openBucket(page, 'upcoming');

    await page
      .getByTestId('profile-visits-upcoming')
      .getByTestId('order-reschedule')
      .first()
      .click();

    await expect(page).toHaveURL(
      new RegExp(`/booking\\?reschedule=${ORDER_ID.upcoming}$`),
      { timeout: 30_000 },
    );
  });

  test('"Keep appointment" dismisses the cancel dialog without a mutation', async ({
    page,
  }) => {
    await openBucket(page, 'upcoming');
    // Any PUT here would be a real cancellation attempt — assert none happens
    let updateSeen = false;
    page.on('request', (request) => {
      if (request.method() === 'PUT' && ORDERS_LIST_RE.test(request.url())) {
        updateSeen = true;
      }
    });

    const section = page.getByTestId('profile-visits-upcoming');
    await section.getByTestId('order-cancel').first().click();

    const confirm = page.getByTestId('order-cancel-confirm');
    await expect(confirm).toBeVisible();
    await confirm.getByTestId('order-cancel-keep').click();

    await expect(page.getByTestId('order-cancel-confirm')).toHaveCount(0);
    await expect(page.getByTestId('order-cancel-success')).toHaveCount(0);
    expect(updateSeen).toBe(false);
  });

  test('confirming the cancellation shows the success dialog', async ({
    page,
  }) => {
    await openBucket(page, 'upcoming');
    let updateSeen = false;
    page.on('request', (request) => {
      if (request.method() === 'PUT' && ORDERS_LIST_RE.test(request.url())) {
        updateSeen = true;
      }
    });

    const section = page.getByTestId('profile-visits-upcoming');
    await section.getByTestId('order-cancel').first().click();
    await page
      .getByTestId('order-cancel-confirm')
      .getByTestId('order-cancel-yes')
      .click();

    const success = page.getByTestId('order-cancel-success');
    await expect(success).toBeVisible({ timeout: 30_000 });
    // The update went out (and was intercepted — no real order was cancelled)
    expect(updateSeen).toBe(true);

    await success.getByTestId('order-cancel-done').click();
    await expect(page.getByTestId('order-cancel-success')).toHaveCount(0);
  });

  test('a paid order that cannot be cancelled offers a refund, not a dead end', async ({
    page,
  }) => {
    // The live failure this covers: a paid order the API refuses to cancel.
    // `isPaidOrderError` matches /paid|payment/i AND the re-read order carries
    // the gateway's `isCompleted: true`, so this refusal takes the refund
    // branch rather than the plain error dialog.
    await mockOrders(page, {
      updateError:
        "Can't update the order. Payment sessions 3 could not be canceled — the order may have been paid.",
      orders: [
        makeOrder(ORDER_ID.upcoming, 'upcoming', 'Upcoming', {
          identifier: 'stripe',
          title: 'Stripe',
          isCompleted: true,
        }),
      ],
    });
    await signInTestUser(page);
    await expect(
      page
        .getByTestId('profile-visits-upcoming')
        .getByTestId('order-services')
        .first(),
    ).toBeVisible({ timeout: 30_000 });

    await page
      .getByTestId('profile-visits-upcoming')
      .getByTestId('order-cancel')
      .first()
      .click();
    await page
      .getByTestId('order-cancel-confirm')
      .getByTestId('order-cancel-yes')
      .click();

    const refund = page.getByTestId('order-refund-request');
    await expect(refund).toBeVisible({ timeout: 30_000 });
    // The guest-facing rewrite, not the API's `updateOrder` wording
    await expect(refund).toContainText('already been paid');
    await expect(refund).not.toContainText('Payment sessions');
    // Neither the dead-end error dialog nor a false success
    await expect(page.getByTestId('order-cancel-error')).toHaveCount(0);
    await expect(page.getByTestId('order-cancel-success')).toHaveCount(0);

    // Dismiss, never confirm: `order-refund-confirm` POSTs to
    // `/api/content/orders/{id}/refund`, which `mockOrders` does not intercept —
    // confirming here would send a live request for a fixture order id.
    await refund.getByTestId('order-refund-dismiss').click();
    await expect(page.getByTestId('order-refund-request')).toHaveCount(0);
  });

  test('payment that landed after the list was cached still earns the refund offer', async ({
    page,
  }) => {
    // The reason the gate RE-READS the order instead of trusting the cached
    // list: the guest paid on the gateway while the profile was already open,
    // so the list still says `isCompleted: false` but the fresh single-order
    // GET says `true`. Only the re-read can reach the refund here — if it is
    // ever lost, the stale-list fallback routes to the error dialog and this
    // test fails.
    await mockOrders(page, {
      updateError:
        "Can't update the order. Payment sessions 3 could not be canceled — the order may have been paid.",
      orders: [
        makeOrder(ORDER_ID.upcoming, 'upcoming', 'Upcoming', {
          identifier: 'stripe',
          title: 'Stripe',
          isCompleted: false,
        }),
      ],
      freshOrders: [
        makeOrder(ORDER_ID.upcoming, 'upcoming', 'Upcoming', {
          identifier: 'stripe',
          title: 'Stripe',
          isCompleted: true,
        }),
      ],
    });
    await signInTestUser(page);
    await expect(
      page
        .getByTestId('profile-visits-upcoming')
        .getByTestId('order-services')
        .first(),
    ).toBeVisible({ timeout: 30_000 });

    await page
      .getByTestId('profile-visits-upcoming')
      .getByTestId('order-cancel')
      .first()
      .click();
    await page
      .getByTestId('order-cancel-confirm')
      .getByTestId('order-cancel-yes')
      .click();

    const refund = page.getByTestId('order-refund-request');
    await expect(refund).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('order-cancel-error')).toHaveCount(0);

    // Dismiss, never confirm — same live-refund caveat as the test above
    await refund.getByTestId('order-refund-dismiss').click();
    await expect(page.getByTestId('order-refund-request')).toHaveCount(0);
  });

  test('a failed re-read falls back to the cached paid order and still offers the refund', async ({
    page,
  }) => {
    // The `.catch(() => undefined)` half of the gate: the single-order GET
    // 404s (empty fresh pool), so the verdict comes from the cached list row —
    // a paid order must not lose its refund offer to a flaky re-read.
    await mockOrders(page, {
      updateError:
        "Can't update the order. Payment sessions 3 could not be canceled — the order may have been paid.",
      orders: [
        makeOrder(ORDER_ID.upcoming, 'upcoming', 'Upcoming', {
          identifier: 'stripe',
          title: 'Stripe',
          isCompleted: true,
        }),
      ],
      freshOrders: [],
    });
    await signInTestUser(page);
    await expect(
      page
        .getByTestId('profile-visits-upcoming')
        .getByTestId('order-services')
        .first(),
    ).toBeVisible({ timeout: 30_000 });

    await page
      .getByTestId('profile-visits-upcoming')
      .getByTestId('order-cancel')
      .first()
      .click();
    await page
      .getByTestId('order-cancel-confirm')
      .getByTestId('order-cancel-yes')
      .click();

    const refund = page.getByTestId('order-refund-request');
    await expect(refund).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('order-cancel-error')).toHaveCount(0);

    // Dismiss, never confirm — same live-refund caveat as the test above
    await refund.getByTestId('order-refund-dismiss').click();
    await expect(page.getByTestId('order-refund-request')).toHaveCount(0);
  });

  test('a stuck UNPAID order gets the salon dialog, not a doomed refund offer', async ({
    page,
  }) => {
    // The other face of the same refusal (live orders #17/#18): the checkout
    // session expired unpaid, Stripe can no longer void it, and the API answers
    // with the identical "may have been paid" wording. A refund here is
    // guaranteed to 404 ("cannot refund uncompleted order"), so the gate must
    // read `isCompleted: false` and route to the honest error dialog instead.
    await mockOrders(page, {
      updateError:
        "Can't update the order. Payment sessions 4 could not be canceled — the order may have been paid.",
      orders: [
        makeOrder(ORDER_ID.unpaid, 'upcoming', 'Upcoming', {
          identifier: 'stripe',
          title: 'Stripe',
          isCompleted: false,
        }),
      ],
    });
    await signInTestUser(page);
    await expect(
      page
        .getByTestId('profile-visits-upcoming')
        .getByTestId('order-services')
        .first(),
    ).toBeVisible({ timeout: 30_000 });

    await page
      .getByTestId('profile-visits-upcoming')
      .getByTestId('order-cancel')
      .first()
      .click();
    await page
      .getByTestId('order-cancel-confirm')
      .getByTestId('order-cancel-yes')
      .click();

    const error = page.getByTestId('order-cancel-error');
    await expect(error).toBeVisible({ timeout: 30_000 });
    // The honest next step, not the plumbing wording and not a refund promise
    await expect(error).toContainText('contact the salon');
    await expect(error).not.toContainText('Payment sessions');
    await expect(page.getByTestId('order-refund-request')).toHaveCount(0);
    await expect(page.getByTestId('order-cancel-success')).toHaveCount(0);

    await error.getByTestId('order-cancel-error-close').click();
    await expect(page.getByTestId('order-cancel-error')).toHaveCount(0);
  });

  test('a refusal that is not about payment still shows the error dialog', async ({
    page,
  }) => {
    // Guards the branch above: a message without "paid"/"payment" must NOT be
    // rerouted into the refund offer.
    await mockOrders(page, {
      updateError: "Can't update the order. Order is locked by the salon.",
    });
    await signInTestUser(page);
    await expect(
      page
        .getByTestId('profile-visits-upcoming')
        .getByTestId('order-services')
        .first(),
    ).toBeVisible({ timeout: 30_000 });

    await page
      .getByTestId('profile-visits-upcoming')
      .getByTestId('order-cancel')
      .first()
      .click();
    await page
      .getByTestId('order-cancel-confirm')
      .getByTestId('order-cancel-yes')
      .click();

    const error = page.getByTestId('order-cancel-error');
    await expect(error).toBeVisible({ timeout: 30_000 });
    await expect(error).toContainText('locked by the salon');
    await expect(page.getByTestId('order-refund-request')).toHaveCount(0);
    await expect(page.getByTestId('order-cancel-success')).toHaveCount(0);

    await error.getByTestId('order-cancel-error-close').click();
    await expect(page.getByTestId('order-cancel-error')).toHaveCount(0);
  });

  test('every visit shows its total; only the unpaid online one offers Pay', async ({
    page,
  }) => {
    await openBucket(page, 'upcoming');

    const section = page.getByTestId('profile-visits-upcoming');
    // Both upcoming cards state the amount and how it is paid
    await expect(section.getByTestId('order-total').first()).toContainText(
      '370',
    );
    await expect(section.getByTestId('order-total').first()).toContainText(
      'Cash',
    );
    // …but only the stripe one that was never completed can be paid now
    await expect(section.getByTestId('order-pay')).toHaveCount(1);
    await expect(section.getByTestId('order-pay')).toContainText('Pay');
  });

  test('Pay sends the client to the gateway, and surfaces a refusal', async ({
    page,
  }) => {
    await openBucket(page, 'upcoming');

    // First attempt: the gateway refuses to open a session
    await mockPayments(page, {
      error: 'Your payment account is not connected',
    });
    const payButton = page
      .getByTestId('profile-visits-upcoming')
      .getByTestId('order-pay');
    await payButton.click();
    await expect(page.getByTestId('order-pay-error')).toContainText(
      'not connected',
    );

    // Second attempt: a session with a checkout URL → the client leaves for it.
    // `/contacts` stands in for the gateway host, which the test cannot reach
    await mockPayments(page, { url: '/contacts' });
    await payButton.click();
    await expect(page).toHaveURL(/\/contacts$/, { timeout: 30_000 });
  });

  test('a completed visit offers Book Again and Leave a review', async ({
    page,
  }) => {
    await openBucket(page, 'completed');

    const section = page.getByTestId('profile-visits-completed');
    await expect(section.getByTestId('order-repeat').first()).toBeVisible();

    // "Leave a review" opens the shared ReviewModal; Confirm stays disabled
    // until a rating and some text are given, and Escape closes the dialog
    await section.getByTestId('order-leave-review').first().click();
    const review = page.getByTestId('review-modal');
    await expect(review).toBeVisible();

    const confirmBtn = review.getByRole('button', { name: 'Confirm' });
    await expect(confirmBtn).toBeDisabled();
    await review.getByRole('button', { name: 'Rate 5 star(s)' }).click();
    await review.getByRole('textbox').fill('Great visit, thank you!');
    await expect(confirmBtn).toBeEnabled();

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('review-modal')).toHaveCount(0);
  });

  test('a canceled visit only offers Book Again, which opens the wizard', async ({
    page,
  }) => {
    await openBucket(page, 'canceled');

    const section = page.getByTestId('profile-visits-canceled');
    await expect(section.getByTestId('order-cancel')).toHaveCount(0);
    await expect(section.getByTestId('order-leave-review')).toHaveCount(0);

    await section.getByTestId('order-repeat').first().click();
    await expect(page).toHaveURL(/\/booking$/, { timeout: 30_000 });
  });
});
