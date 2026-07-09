import { expect, test } from '@playwright/test';

test.describe('Header navigation and search', () => {
  // The header search bar is hidden below the 2xl breakpoint (1536px)
  test.use({ viewport: { width: 1600, height: 900 } });

  test('main menu from the OneEntry Menus API navigates between pages', async ({
    page,
  }) => {
    await page.goto('/');

    const nav = page.locator('#header nav');
    await expect(nav).toBeVisible();

    // Menu items come from the CMS — follow the first non-home link
    const menuLink = nav.locator('a[href^="/"]:not([href="/"])').first();
    const href = await menuLink.getAttribute('href');
    await menuLink.click();

    await expect(page).toHaveURL(new RegExp(`${href}$`));
  });

  test('typing a query opens the live search dropdown', async ({ page }) => {
    await page.goto('/');

    const input = page.getByTestId('header-search-input');
    await expect(input).toBeVisible();
    await input.fill('hair');

    // Debounce is 300ms; the dropdown shows either results or "No products found"
    await expect(page.getByTestId('search-results')).toBeVisible({
      timeout: 15_000,
    });
  });

  test('submitting the search navigates to the services page', async ({
    page,
  }) => {
    await page.goto('/');

    const input = page.getByTestId('header-search-input');
    await input.fill('hair');
    // The input pushes the query into the URL via router.replace (300ms
    // debounce) — wait for it before submitting, otherwise the submit
    // handler reads stale (empty) searchParams
    await expect(page).toHaveURL(/search=hair/);
    await input.press('Enter');

    await expect(page).toHaveURL(/\/services\?.*search=hair/);
  });
});
