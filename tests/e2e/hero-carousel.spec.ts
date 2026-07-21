import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

// The home hero carousel (`HeroSlider`) and the a11y work behind it (§5.10 of
// MISMATCH-LOG): manual prev/next/dot navigation, auto-advance, pause while a
// control has keyboard focus, `aria-hidden` on the off-screen slides and the
// `prefers-reduced-motion` opt-out.
//
// Slides come from the CMS `home_hero` block, so the carousel can legitimately
// hold a single slide — the controls are then not rendered and the tests skip.
// The auto-advance interval is CMS-driven too (5s at the time of writing), so
// the timing assertions work off a generous ceiling instead of the exact value.

/** Ceiling for one auto-advance tick — comfortably above the CMS interval. */
const TICK_CEILING_MS = 15_000;

/**
 * The hero carousel region on the home page.
 * @param   {Page}    page - Playwright page
 * @returns {Locator}      The carousel section
 */
const hero = (page: Page): Locator =>
  page.getByRole('region', { name: 'Promotions' });

/**
 * All slide groups of the carousel.
 * @param   {Page}    page - Playwright page
 * @returns {Locator}      The slide elements
 */
const slides = (page: Page): Locator =>
  hero(page).locator('[role="group"][aria-roledescription="slide"]');

/**
 * The slide currently shown — the only one not hidden from assistive tech.
 * @param   {Page}    page - Playwright page
 * @returns {Locator}      The active slide
 */
const activeSlide = (page: Page): Locator =>
  slides(page).and(page.locator('[aria-hidden="false"]'));

/**
 * The 1-based index of the slide currently shown.
 *
 * The active slide's label reads "N of M", so the accessibility state doubles
 * as the assertion hook and no test-only attribute is needed.
 * @param   {Page}            page - Playwright page
 * @returns {Promise<number>}      Index of the active slide, 1-based
 */
const activeIndex = async (page: Page): Promise<number> => {
  const label = await activeSlide(page).first().getAttribute('aria-label');
  return Number((label ?? '').split(' ')[0]);
};

test.describe('Home hero carousel', () => {
  // Desktop: the arrows and dots sit on the full-width banner
  test.use({ viewport: { width: 1280, height: 900 } });

  test('exactly one slide is exposed to assistive tech', async ({ page }) => {
    await page.goto('/');
    await expect(slides(page).first()).toBeAttached({ timeout: 30_000 });

    const total = await slides(page).count();
    // Off-screen slides carry their own <h1>; hiding all but one keeps a single
    // heading (and a single copy of the overlay text) in the a11y tree
    await expect(activeSlide(page)).toHaveCount(1);
    await expect(
      slides(page).and(page.locator('[aria-hidden="true"]')),
    ).toHaveCount(total - 1);
  });

  test('arrows and dots move between slides', async ({ page }) => {
    await page.goto('/');
    await expect(slides(page).first()).toBeAttached({ timeout: 30_000 });

    const total = await slides(page).count();
    test.skip(total < 2, 'the CMS slider holds a single slide');

    const next = hero(page).getByRole('button', { name: 'Next slide' });
    const prev = hero(page).getByRole('button', { name: 'Previous slide' });

    // Park the pointer on the banner first: hovering pauses the auto-advance,
    // so the index cannot shift under the assertions below
    await hero(page).hover();
    const start = await activeIndex(page);

    await next.click();
    await expect.poll(() => activeIndex(page)).toBe((start % total) + 1);

    await prev.click();
    await expect.poll(() => activeIndex(page)).toBe(start);

    // Wraps around backwards past the first slide
    await hero(page).getByRole('button', { name: 'Go to slide 1' }).click();
    await expect.poll(() => activeIndex(page)).toBe(1);
    await prev.click();
    await expect.poll(() => activeIndex(page)).toBe(total);
  });

  test('auto-advances on its own, and pauses while a control has focus', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(slides(page).first()).toBeAttached({ timeout: 30_000 });

    const total = await slides(page).count();
    test.skip(total < 2, 'the CMS slider holds a single slide');

    // The pointer is parked outside the page, so nothing pauses the timer
    const start = await activeIndex(page);
    await expect
      .poll(() => activeIndex(page), { timeout: TICK_CEILING_MS })
      .not.toBe(start);

    // Keyboard focus on a control pauses it (`onFocusCapture`) — the slide has
    // to stay put for well over one interval
    await hero(page).getByRole('button', { name: 'Next slide' }).focus();
    const paused = await activeIndex(page);
    await page.waitForTimeout(TICK_CEILING_MS);
    expect(await activeIndex(page)).toBe(paused);
  });
});

test.describe('Home hero carousel — reduced motion', () => {
  // Users asking for less motion get a static hero: no auto-advance at all,
  // while the arrows keep working (WCAG 2.2.2 / 2.3.3)
  test.use({
    viewport: { width: 1280, height: 900 },
    // `reducedMotion` is a context option in this Playwright version
    contextOptions: { reducedMotion: 'reduce' },
  });

  test('does not auto-advance, but stays manually operable', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(slides(page).first()).toBeAttached({ timeout: 30_000 });

    const total = await slides(page).count();
    test.skip(total < 2, 'the CMS slider holds a single slide');

    expect(await activeIndex(page)).toBe(1);
    await page.waitForTimeout(TICK_CEILING_MS);
    expect(await activeIndex(page)).toBe(1);

    await hero(page).getByRole('button', { name: 'Next slide' }).click();
    await expect.poll(() => activeIndex(page)).toBe(2);
  });
});
