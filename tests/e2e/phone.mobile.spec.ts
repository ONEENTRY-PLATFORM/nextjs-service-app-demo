import { expect, test } from '@playwright/test';

// Phone-only surfaces, run by the `Mobile Chrome` project (Pixel 5 — 393px,
// touch). These components are hidden from the desktop suite by breakpoint:
// `MobileSpecialistList` (< lg / < md rows) and the
// mobile "Call us" CTA of a salon card (< md). The mobile menu itself has its
// own spec in the same project (`mobile-nav.mobile.spec.ts`).

test.describe('Phone layout', () => {
  test('the specialists page shows the compact row list with search', async ({
    page,
  }) => {
    await page.goto('/masters');

    const rows = page.getByTestId('master-row');
    await expect(rows.first()).toBeVisible({ timeout: 30_000 });
    const total = await rows.count();

    // The phone list carries its own search box (the desktop grid has another)
    const search = page.locator('[data-testid="masters-search-input"]:visible');
    await search.fill('zzqqxx');
    await expect(page.getByTestId('masters-rows-empty')).toBeVisible();

    await search.fill('');
    await expect.poll(() => rows.count()).toBe(total);
  });

  test('a salon card offers "Call us" instead of Directions', async ({
    page,
  }) => {
    await page.goto('/contacts');

    const card = page.getByTestId('salon-card').first();
    await expect(card).toBeVisible({ timeout: 30_000 });

    // Mock parity: on a phone the CTA dials the salon; the maps link is the
    // tablet/desktop variant and stays hidden here
    const call = card.getByTestId('salon-call');
    await expect(call).toBeVisible();
    await expect(call).toHaveAttribute('href', /^tel:\+?\d/);
    await expect(card.getByTestId('salon-directions')).toBeHidden();
  });
});
