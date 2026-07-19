import { expect, test } from '@playwright/test';

// The homepage stitches together several CMS-driven sections. Each is revealed
// by a GSAP scroll animation, so presence is asserted with `toBeAttached`
// rather than visibility (mirroring content.spec). The offers feed is left out
// on purpose — its `similarProducts` payload is dropped by the API under a
// traffic limit, so the section can legitimately be absent; /offers covers it.
test.describe('Home page sections', () => {
  test('service catalog grid renders category tiles', async ({ page }) => {
    await page.goto('/');

    const catalog = page.getByTestId('home-catalog');
    await expect(catalog).toBeAttached({ timeout: 30_000 });
    await expect(catalog.getByTestId('catalog-card').first()).toBeAttached({
      timeout: 30_000,
    });
  });

  test('gallery strip renders photo tiles', async ({ page }) => {
    await page.goto('/');

    // The gallery feed always renders — it falls back to the local photo
    // library when the CMS gallery tree is empty
    const gallery = page.getByTestId('home-gallery');
    await expect(gallery).toBeAttached({ timeout: 30_000 });
    await expect(
      gallery.getByTestId('gallery-strip-item').first(),
    ).toBeAttached({ timeout: 30_000 });
  });

  test('specialists strip renders master cards linking to profiles', async ({
    page,
  }) => {
    await page.goto('/');

    const masters = page.getByTestId('home-masters');
    await expect(masters).toBeAttached({ timeout: 30_000 });

    const card = masters.getByTestId('master-card').first();
    await expect(card).toBeAttached({ timeout: 30_000 });
    await expect(card).toHaveAttribute('href', /^\/masters\/\d+$/);
  });
});
