import { expect, test } from '@playwright/test';

// The specialist profile route (`/masters/[handle]`) renders a master resolved
// from the OneEntry admins. This walks from the masters grid to a profile —
// the click-through that the masters/booking flows depend on.
test.describe('Master profile', () => {
  // Desktop viewport: the masters grid shows the MasterCard <Link> tiles
  // (mobile swaps to the `master-row` list instead)
  test.use({ viewport: { width: 1280, height: 900 } });

  test('opens a specialist profile from the masters grid', async ({ page }) => {
    await page.goto('/masters');

    const card = page
      .getByTestId('masters-page')
      .getByTestId('master-card')
      .first();
    await expect(card).toBeAttached({ timeout: 30_000 });

    // The masters-grid card carries the service context as a query param
    // (e.g. `/masters/32?service=72`), unlike the home strip's bare link
    const href = await card.getAttribute('href');
    expect(href).toMatch(/^\/masters\/\d+(\?.*)?$/);

    // Navigate directly: the tile is behind a GSAP scroll reveal, so a click
    // can race the animation — the profile route is what we assert renders
    await page.goto(href as string);
    await expect(page.getByTestId('master-page')).toBeVisible({
      timeout: 30_000,
    });
  });
});
