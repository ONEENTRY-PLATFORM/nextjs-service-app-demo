import { expect, test } from '@playwright/test';

// The header renders the gradient "Book Online" pill twice (BookOnlineLink): a
// compact one centered in the header row on mobile (`md:hidden`) and a larger one
// in the right actions group on md+ (`hidden md:block`). Both link to /booking.
// The CTA that starts the whole booking funnel had no coverage — this asserts the
// visible variant navigates at each viewport.
test.describe('Header “Book Online” CTA', () => {
  test('desktop pill navigates to the booking wizard', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    // The visible pill at ≥ md is the desktop variant
    const cta = page
      .locator('[data-testid="book-online-link"]:visible')
      .first();
    await expect(cta).toBeVisible({ timeout: 30_000 });
    await expect(cta).toHaveAttribute('data-variant', 'desktop');
    // Next strips the trailing slash from the rendered anchor href
    await expect(cta).toHaveAttribute('href', /\/booking\/?$/);

    await cta.click();
    await expect(page).toHaveURL(/\/booking\/?$/);
    await expect(page.getByTestId('booking-page')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('mobile pill navigates to the booking wizard', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Below md only the mobile variant is shown
    const cta = page
      .locator('[data-testid="book-online-link"]:visible')
      .first();
    await expect(cta).toBeVisible({ timeout: 30_000 });
    await expect(cta).toHaveAttribute('data-variant', 'mobile');

    await cta.click();
    await expect(page).toHaveURL(/\/booking\/?$/);
    await expect(page.getByTestId('booking-page')).toBeVisible({
      timeout: 30_000,
    });
  });
});
