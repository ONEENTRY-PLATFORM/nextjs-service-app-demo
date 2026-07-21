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

/** Fixture order ids, one per status bucket. */
const ORDER_ID = { upcoming: 900001, completed: 900002, canceled: 900003 };

/**
 * Build one fixture order for a status bucket.
 *
 * Only the fields the profile actually reads are provided: the status, the
 * booked products (title + duration lookup key), and the `interval` /
 * `master` form fields. `salon` is deliberately omitted — the card's salon
 * lookup is an extra request that adds nothing to the flows under test.
 * @param   {number} id          - Order id
 * @param   {string} status      - Order status identifier (`upcoming` / `completed` / `canceled`)
 * @param   {string} statusTitle - Human-readable status, shown in the badge
 * @returns {object}             Order entity as the orders API returns it
 */
const makeOrder = (
  id: number,
  status: string,
  statusTitle: string,
): Record<string, unknown> => ({
  id,
  statusIdentifier: status,
  statusLocalizeInfos: { title: statusTitle },
  createdDate: '2026-07-01T10:00:00.000Z',
  formIdentifier: 'order',
  paymentAccountIdentifier: 'cash',
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

/** The three fixture orders, one per bucket. */
const FIXTURE_ORDERS = [
  makeOrder(ORDER_ID.upcoming, 'upcoming', 'Upcoming'),
  makeOrder(ORDER_ID.completed, 'completed', 'Completed'),
  makeOrder(ORDER_ID.canceled, 'canceled', 'Canceled'),
];

/**
 * Serve the fixture order list and swallow order updates.
 *
 * Everything else (getMe, catalog, masters…) passes through untouched, so the
 * page renders against the live CMS apart from the history itself.
 * @param   {Page}          page - Playwright page
 * @returns {Promise<void>}      Resolves once the route is installed
 */
const mockOrders = async (page: Page): Promise<void> => {
  await page.route(ORDERS_LIST_RE, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: FIXTURE_ORDERS, total: 3 }),
      });
      return;
    }
    if (method === 'PUT') {
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

    for (const status of ['upcoming', 'completed', 'canceled']) {
      const section = page.getByTestId(`profile-visits-${status}`);
      await expect(section).toBeVisible({ timeout: 30_000 });
      // Each bucket holds exactly one fixture order
      await expect(section.getByRole('button').first()).toContainText('1');
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
    await review.getByRole('button', { name: 'Rate 5 stars' }).click();
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
