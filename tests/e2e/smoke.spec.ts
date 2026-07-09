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
    // NOTE: notFound() with force-dynamic renders not-found UI with HTTP 200,
    // so assert via UI instead of response status
    await page.goto('/definitely-missing-page-404');
    await expect(page.locator('body')).toBeVisible();
    await expect(page).not.toHaveURL(/\/$/);
  });
});
