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
    // No explicit scrollIntoViewIfNeeded: it has no detach-retry, and the grid
    // re-mounts around this moment. `click` scrolls by itself and re-resolves
    // the locator when the node detaches mid-action.
    await expect(firstItem).toBeVisible({ timeout: 30_000 });
    await firstItem.click();

    const lightbox = page.getByTestId('gallery-lightbox');
    await expect(lightbox).toBeVisible({ timeout: 15_000 });
    // The counter reads "n / total"
    await expect(lightbox).toContainText('/');

    await page.keyboard.press('Escape');
    await expect(lightbox).toHaveCount(0);
  });

  test('arrow keys page through the photos', async ({ page }) => {
    await page.goto('/gallery');

    const items = page.getByTestId('gallery-page').getByTestId('gallery-item');
    await expect(items.first()).toBeVisible({ timeout: 30_000 });
    const total = await items.count();
    test.skip(total < 2, 'needs at least two photos to page through');

    // `click` scrolls by itself — see the note in the first test
    await items.first().click();

    const lightbox = page.getByTestId('gallery-lightbox');
    await expect(lightbox).toBeVisible({ timeout: 15_000 });
    // The counter reads "n / total" — it is the visible index state
    await expect(lightbox).toContainText(`1 / ${total}`);

    await page.keyboard.press('ArrowRight');
    await expect(lightbox).toContainText(`2 / ${total}`);

    await page.keyboard.press('ArrowLeft');
    await expect(lightbox).toContainText(`1 / ${total}`);

    // Paging wraps around backwards from the first photo
    await page.keyboard.press('ArrowLeft');
    await expect(lightbox).toContainText(`${total} / ${total}`);
  });

  test('category deep-link renders CMS photos, not the local fallback', async ({
    page,
  }) => {
    // Regression for MISMATCH-LOG 2.2: /gallery/[handle] used to render only the
    // local hardcoded library (getLocalGalleryItems), unlike /gallery which is
    // CMS-first. Now it shares the source, so the photos are served from the
    // OneEntry CDN (oneentry.cloud) rather than a local /images path.
    await page.goto('/gallery/gallery-hair');

    const item = page
      .getByTestId('gallery-page')
      .getByTestId('gallery-item')
      .first();
    await expect(item).toBeAttached({ timeout: 30_000 });

    const src = await item.locator('img').first().getAttribute('src');
    // next/image proxies through /_next/image?url=<encoded CMS url> — the CMS
    // host survives URL-encoding (dots are not escaped); the local fallback
    // would instead carry an encoded `/images/…` path.
    expect(src ?? '').toContain('oneentry.cloud');
  });
});
