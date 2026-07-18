import { expect, test } from '@playwright/test';

import { hasCreds, signInTestUser, walkBookingToDateTime } from './fixtures/helpers';

/**
 * booking-stripe.spec.ts — live Stripe checkout for the booking flow.
 *
 * The online-payment analogue of booking-order.spec (which pays "cash"): sign in,
 * walk the wizard, pick the Stripe account and confirm. The app then runs
 * `Orders.createOrder` → `Payments.createSession` → `paymentUrl` and does a full
 * navigation to the hosted Stripe Checkout — reaching `checkout.stripe.com`
 * proves the online-payment path end-to-end.
 *
 * Completing the payment ON the hosted page is intentionally NOT automated: the
 * live Checkout re-renders as it initialises and varies its fields by geo, which
 * makes card entry unavoidably flaky (same rationale as the restaurant demo).
 *
 * Gated behind `E2E_STRIPE=1` — it hits the live backend and creates a real
 * test-mode order. Note: OneEntry's payment session 500s on a fractional order
 * total, so this relies on the first catalog service having a whole-number price.
 * Clean up created orders with `.claude/temp/cancel-test-orders.mjs`.
 *
 *   E2E_STRIPE=1 npx playwright test booking-stripe --project=chromium
 */
const RUN = !!process.env.E2E_STRIPE;
const STRIPE_CHECKOUT_RE = /checkout\.stripe\.com/;

test.describe.serial('Booking → Stripe', () => {
  // Desktop viewport: the summary + payment picker live in the right column
  test.use({ viewport: { width: 1440, height: 900 } });
  // Sign in → wizard → hosted Checkout exceeds the default 60s budget
  test.describe.configure({ timeout: 120_000 });

  test.beforeEach(() => {
    test.skip(
      !RUN,
      'Set E2E_STRIPE=1 to run the live Stripe booking flow (creates a real test-mode order).',
    );
    test.skip(!hasCreds(), 'E2E_USER_EMAIL / E2E_USER_PASSWORD not set');
  });

  test('online payment redirects to the hosted Stripe Checkout', async ({
    page,
  }) => {
    await signInTestUser(page);
    await page.goto('/booking');
    await walkBookingToDateTime(page);

    // Choose the online (Stripe) account instead of cash
    const summary = page.getByTestId('booking-summary');
    const stripe = summary.locator(
      '[data-testid="payment-method"][data-payment-id="stripe"]',
    );
    await expect(stripe).toBeVisible({ timeout: 30_000 });
    await stripe.click();

    // Confirm → createOrder → createSession → full-page redirect to Stripe
    const confirm = page.getByTestId('booking-confirm');
    await expect(confirm).toBeEnabled();
    await confirm.click();

    await page.waitForURL(STRIPE_CHECKOUT_RE, { timeout: 60_000 });
    await expect(page).toHaveURL(STRIPE_CHECKOUT_RE);
  });
});
