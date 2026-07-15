import { expect, test } from '@playwright/test';

test.describe('Smoke', () => {
  test('the homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).not.toHaveURL(/error/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('the services page loads', async ({ page }) => {
    await page.goto('/services');
    await expect(page.locator('body')).toBeVisible();
  });

  test('the masters page loads', async ({ page }) => {
    await page.goto('/masters');
    await expect(page.locator('body')).toBeVisible();
  });

  test('unknown route shows the not-found UI', async ({ page }) => {
    // NOTE: notFound() may render the not-found UI with HTTP 200, so assert the
    // UI itself — `body` alone is visible on every page and proves nothing.
    await page.goto('/definitely-missing-page-404');
    await expect(page.getByTestId('not-found')).toBeVisible();
    await expect(
      page.getByRole('link', { name: /return home/i }),
    ).toBeVisible();
  });

  test('a real route does NOT render the not-found UI', async ({ page }) => {
    // Guards the assertion above: it must fail on a 404 page only.
    await page.goto('/');
    await expect(page.getByTestId('not-found')).toHaveCount(0);
  });
});
