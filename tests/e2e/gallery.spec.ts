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
