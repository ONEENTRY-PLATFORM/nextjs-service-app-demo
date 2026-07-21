import { expect, test } from '@playwright/test';

// The mobile header (< lg) collapses the main menu behind a hamburger that
// toggles the inline `MobileNavPanel` (a grid-rows height animation under the
// header row). The desktop nav specs run at >=1024px where this panel is
// `lg:hidden`, so the whole mobile surface — trigger, panel, link → navigate —
// is only exercised here.
//
// Runs in the `Mobile Chrome` project (Pixel 5): a real phone profile with
// touch, not a narrowed desktop — hence the `.mobile.spec.ts` suffix.
test.describe('Mobile navigation', () => {
  test('hamburger opens the panel, a link navigates and closes it', async ({
    page,
  }) => {
    await page.goto('/');

    const toggle = page.getByTestId('mobile-nav-toggle');
    const panel = page.getByTestId('mobile-nav-panel');
    await expect(toggle).toBeVisible({ timeout: 30_000 });

    // Collapsed by default: the panel is in the DOM but has zero height
    await expect(panel).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    // Open → the panel expands and its CMS menu links become visible
    await toggle.click();
    await expect(panel).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(panel.getByTestId('mobile-nav-link').first()).toBeVisible();

    // Follow the first non-home link — home resolves to "/" and would not
    // change the URL, defeating the navigation assertion
    const link = panel
      .locator('[data-testid="mobile-nav-link"]:not([href="/"])')
      .first();
    const href = await link.getAttribute('href');
    expect(href, 'expected at least one non-home menu link').toBeTruthy();
    await link.click();

    // Navigated to the picked page, and the panel closed itself on selection
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(panel).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('the toggle closes the panel again without navigating', async ({
    page,
  }) => {
    await page.goto('/');

    const toggle = page.getByTestId('mobile-nav-toggle');
    const panel = page.getByTestId('mobile-nav-panel');
    await expect(toggle).toBeVisible({ timeout: 30_000 });

    // Open then close via the same trigger (icon swaps Menu ↔ X)
    await toggle.click();
    await expect(panel).toBeVisible();

    await toggle.click();
    await expect(panel).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    // Still on the homepage — closing must not navigate
    await expect(page).toHaveURL(/\/$/);
  });
});
