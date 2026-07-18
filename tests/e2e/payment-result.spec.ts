import { expect, test } from '@playwright/test';

// The Stripe hosted checkout returns the client to /payment_success or
// /payment_canceled (the URLs are configured on the OneEntry account). Both
// render through the app/[handle] catch-all (PaymentSuccess / PaymentCanceled),
// which shows the CMS page title as an <h1>.
test.describe('Payment result pages', () => {
  const pages = [
    { name: 'success', url: '/payment_success' },
    { name: 'canceled', url: '/payment_canceled' },
  ];

  for (const { name, url } of pages) {
    test(`${name} landing renders its CMS title`, async ({ page }) => {
      await page.goto(url);

      // Degrade gracefully if the CMS page is ever removed (route → not-found)
      const missing = await page
        .getByTestId('not-found')
        .isVisible()
        .catch(() => false);
      test.skip(missing, `CMS page for ${url} is not present`);

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({
        timeout: 30_000,
      });
    });
  }
});
