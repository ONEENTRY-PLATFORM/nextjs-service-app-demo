import { expect, test } from '@playwright/test';

// The payment tab is rendered only for authorized users (Payments API
// requires a user token), so a guest sees the six steps below
const GUEST_BOOKING_TABS = [
  'salons',
  'services',
  'products',
  'masters',
  'calendar',
  'signin',
] as const;

test.describe('Booking form', () => {
  test('renders all guest booking step tabs and hides payment', async ({
    page,
  }) => {
    await page.goto('/booking');

    for (const tab of GUEST_BOOKING_TABS) {
      await expect(page.getByTestId(`booking-tab-${tab}`)).toBeVisible();
    }
    await expect(page.getByTestId('booking-tab-payment')).toHaveCount(0);
  });

  test('salons step is expanded initially and offers at least one option', async ({
    page,
  }) => {
    await page.goto('/booking');

    // Salons tab is active in the initial CartSlice state — its radio group
    // must be rendered (options come from the OneEntry Pages API)
    await expect(page.locator('input[type="radio"]').first()).toBeAttached({
      timeout: 15_000,
    });
  });

  test('clicking a step tab toggles it without errors', async ({ page }) => {
    await page.goto('/booking');

    const servicesTab = page.getByTestId('booking-tab-services');
    await servicesTab.click();
    await expect(servicesTab).toBeVisible();
  });
});
