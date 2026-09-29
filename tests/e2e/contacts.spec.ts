import { expect, test } from '@playwright/test';

// The contacts page (`app/contacts/page.tsx`) renders the salon location cards
// from the CMS `salons` child pages, a "Get in Touch" form and the opening
// hours. content.spec already covers the hero title — this goes deeper into the
// locations and the salon-detail click-through.
test.describe('Contacts page', () => {
  test('renders the locations section and the contact form', async ({
    page,
  }) => {
    await page.goto('/contacts');

    const contacts = page.getByTestId('contacts-page');
    await expect(contacts).toBeVisible({ timeout: 30_000 });

    await expect(
      contacts.getByRole('heading', { name: /our locations/i }),
    ).toBeVisible();
    // Salons exist in the CMS, so the empty-state must NOT be shown
    await expect(page.getByTestId('contacts-salons-empty')).toHaveCount(0);

    // Scrolled to first: the form is revealed by `RevealAnimations`, a ScrollTrigger that fires
    // at `top 88%` of the viewport. Below the fold it sits at its `autoAlpha: 0` start — present,
    // laid out, `visibility: hidden` — and `toBeVisible` does not scroll on its own the way an
    // action does. A reader reaches it by scrolling; so does this.
    const form = page.getByTestId('contact-form');
    await form.scrollIntoViewIfNeeded();
    await expect(form).toBeVisible();
  });

  test('a "View studio" link opens the salon detail page', async ({ page }) => {
    await page.goto('/contacts');

    // Each salon card links to its detail route (`/salons/{pageUrl}`)
    const viewStudio = page
      .getByTestId('contacts-page')
      .getByRole('link', { name: /view studio/i })
      .first();
    // Same reveal-on-scroll as the form above.
    await viewStudio.scrollIntoViewIfNeeded();
    await expect(viewStudio).toBeVisible({ timeout: 30_000 });

    const href = await viewStudio.getAttribute('href');
    expect(href).toMatch(/^\/salons\/[a-z0-9-]+$/i);

    await viewStudio.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    // The salon detail body renders (heading + gallery + about)
    await expect(page.getByTestId('salon-page')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByTestId('salon-page').getByRole('heading', { level: 1 }),
    ).toBeVisible();
  });
});
