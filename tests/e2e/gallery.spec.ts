import { expect, test } from '@playwright/test';

// The gallery page grid opens each photo in a fullscreen lightbox
// (`GalleryLightbox`) with keyboard navigation. content.spec already asserts
// the grid renders from the Pages API — this covers the lightbox interaction.
test.describe('Gallery lightbox', () => {
  test('opening a photo shows the lightbox and Escape closes it', async ({
    page,
  }) => {
    await page.goto('/gallery');

    const firstItem = page
      .getByTestId('gallery-page')
      .getByTestId('gallery-item')
      .first();
    await expect(firstItem).toBeAttached({ timeout: 30_000 });
    await firstItem.scrollIntoViewIfNeeded();
    await firstItem.click();

    const lightbox = page.getByTestId('gallery-lightbox');
    await expect(lightbox).toBeVisible({ timeout: 15_000 });
    // The counter reads "n / total"
    await expect(lightbox).toContainText('/');

    await page.keyboard.press('Escape');
    await expect(lightbox).toHaveCount(0);
  });
});
