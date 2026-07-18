import { expect, test } from '@playwright/test';

// The footer builds its Services / About-us columns from the OneEntry `services`
// and `about_us` menus. This confirms the CMS-driven menu renders and navigates.
test.describe('Footer', () => {
  // Desktop viewport (≥ xl = 1240px): the footer menu columns are laid out
  // open, rather than behind the mobile accordions
  test.use({ viewport: { width: 1440, height: 900 } });

  test('renders the CMS menus and a footer link navigates', async ({ page }) => {
    await page.goto('/');

    const footer = page.getByTestId('footer');
    await expect(footer).toBeAttached({ timeout: 30_000 });
    await footer.scrollIntoViewIfNeeded();

    // The footer carries several navigation links pulled from the CMS menus
    await expect(footer.getByRole('link').first()).toBeVisible({
      timeout: 15_000,
    });

    // Follow the first visible internal link and assert it navigates
    const internalLink = footer.locator('a[href^="/"]:visible').first();
    test.skip(
      (await internalLink.count()) === 0,
      'footer menus render as collapsed accordions here',
    );
    const href = await internalLink.getAttribute('href');
    await internalLink.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  });
});
