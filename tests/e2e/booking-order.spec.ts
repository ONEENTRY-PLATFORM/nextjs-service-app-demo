import { expect, test } from '@playwright/test';

import {
  hasCreds,
  signInTestUser,
  walkBookingToDateTime,
} from './fixtures/helpers';

// The cash booking flow end-to-end — WITHOUT writing to the CMS. The OneEntry
// `createOrder` POST is intercepted and fulfilled with a fake order, so the UI
// runs the full confirm → success path (dispatch, success modal) while no real
// order is created. The real createOrder + payment-session integration is
// exercised by the gated booking-stripe.spec instead.
//
// createOrder is the only POST the confirm step makes to the OneEntry orders
// API (`/api/content/orders…`), so match that host prefix broadly and gate on
// the POST method — this is robust to the exact SDK path (orders vs
// orders-storage base, trailing query). SDK response validation is disabled in
// this project, so a minimal `{ id }` object satisfies the confirm logic.
const ORDERS_API_RE = /\/api\/content\/orders/;

test.describe('Booking → order (cash, createOrder mocked)', () => {
  // Desktop viewport (≥ xl = 1240px): the summary + payment picker sit in the
  // right column, and the specialist grid shows the desktop cards
  test.use({ viewport: { width: 1440, height: 900 } });

  test('completes the wizard and shows the success modal', async ({ page }) => {
    test.skip(!hasCreds(), 'E2E_USER_EMAIL / E2E_USER_PASSWORD not set');

    // Intercept ONLY the createOrder POST; every other OneEntry request passes
    // through (profile/getMe, accounts, catalog…).
    let createOrderIntercepted = false;
    await page.route(ORDERS_API_RE, async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }
      createOrderIntercepted = true;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 999999, statusIdentifier: 'upcoming' }),
      });
    });

    await signInTestUser(page);
    await page.goto('/booking');
    await walkBookingToDateTime(page);

    // Pay "cash" (offline) → confirm ends on the success modal, no gateway
    const summary = page.getByTestId('booking-summary');
    const cash = summary.locator(
      '[data-testid="payment-method"][data-payment-id="cash"]',
    );
    await expect(cash).toBeVisible({ timeout: 30_000 });
    await cash.click();

    const confirm = page.getByTestId('booking-confirm');
    await expect(confirm).toBeEnabled();
    await confirm.click();

    await expect(page.getByTestId('booking-success')).toBeVisible({
      timeout: 30_000,
    });

    // Prove the order POST was intercepted (no real order written to the CMS)
    expect(createOrderIntercepted).toBe(true);
  });
});
