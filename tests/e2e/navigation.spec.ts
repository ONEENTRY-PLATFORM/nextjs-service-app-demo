import { expect, test } from '@playwright/test';

test.describe('Header navigation and search', () => {
  // The header search trigger is `hidden lg:flex` — only rendered from 1024px up
  test.use({ viewport: { width: 1600, height: 900 } });

  test('main menu from the OneEntry Menus API navigates between pages', async ({
    page,
  }) => {
    await page.goto('/');

    const nav = page.getByTestId('main-nav');
    await expect(nav).toBeVisible({ timeout: 30_000 });

    // Menu items come from the CMS — follow the first non-home top-level link.
    // Scoped to `main-nav-link` so dropdown children (`main-nav-sublink`,
    // hidden until group-hover) can never be picked up
    const menuLink = nav
      .getByTestId('main-nav-link')
      .and(page.locator('[data-menu-href]:not([data-menu-href="/"])'))
      .first();
    const href = await menuLink.getAttribute('data-menu-href');
    await menuLink.click();

    await expect(page).toHaveURL(new RegExp(`${href}$`));
  });

  test('typing a query opens the live search dropdown', async ({ page }) => {
    await page.goto('/');

    // The input lives inside the search popup — it does not exist until the
    // header icon opens it (SearchModal renders it behind an `open` gate)
    await page.getByTestId('header-search-open').click();

    const input = page.getByTestId('header-search-input');
    await expect(input).toBeVisible();
    await input.fill('hair');

    // Debounce is 300ms, then the results come from the CMS
    await expect(page.getByTestId('search-results')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('a query with no matches shows the empty state', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('header-search-open').click();
    // A term no service title and no specialist name can contain
    await page.getByTestId('header-search-input').fill('zzqqxx-no-such-thing');

    const empty = page.getByTestId('search-empty');
    await expect(empty).toBeVisible({ timeout: 30_000 });
    await expect(empty).toContainText('zzqqxx-no-such-thing');
    await expect(page.getByTestId('search-results')).toHaveCount(0);
  });

  test('the search popup closes with its button and with Escape', async ({
    page,
  }) => {
    await page.goto('/');

    // Close button — the popup (and with it the input) is unmounted
    await page.getByTestId('header-search-open').click();
    await expect(page.getByTestId('header-search-input')).toBeVisible();
    await page.getByRole('button', { name: 'Close search' }).click();
    await expect(page.getByTestId('header-search-input')).toHaveCount(0);

    // Escape — same result (the popup keeps its term in state, but unmounts)
    await page.getByTestId('header-search-open').click();
    await page.getByTestId('header-search-input').fill('hair');
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('header-search-input')).toHaveCount(0);
  });

  test('picking a service from the search results opens its page', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByTestId('header-search-open').click();
    await page.getByTestId('header-search-input').fill('hair');

    // Rows are equivalent — any one proves the result → page navigation
    const service = page.getByTestId('search-result-service').first();
    await expect(service).toBeVisible({ timeout: 30_000 });

    const href = await service.getAttribute('href');
    await service.click();

    await expect(page).toHaveURL(new RegExp(`${href}$`));
  });
});
