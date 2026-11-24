import { expect, type Page, test as base } from '@playwright/test';

/**
 * waitForStreamedSegments — wait until React has moved every streamed Suspense
 * segment into place.
 *
 * During a streamed SSR response React parks a resolved boundary in a hidden
 * `<div hidden id="S:n">` and an inline script swaps it in. Under parallel load
 * that hidden copy can sit in the DOM next to the content already shown, so a
 * strict `getByTestId(...)` resolves to two elements and fails, although the
 * user only ever sees one. Waiting for the hidden segments to go away makes the
 * specs assert on the settled page.
 * @param   {Page}          page - Playwright page
 * @returns {Promise<void>}      Resolves once no hidden streamed segment is left
 */
export const waitForStreamedSegments = async (page: Page): Promise<void> => {
  await page
    .waitForFunction(
      () => !document.querySelector('div[hidden][id^="S:"]'),
      undefined,
      { timeout: 15_000 },
    )
    // A segment that never resolves is the page's own failure — let the spec's
    // assertions report it instead of a generic timeout here.
    .catch(() => undefined);
};

/**
 * `test` with a `page` whose `goto` / `reload` wait for streamed segments
 * (see {@link waitForStreamedSegments}). Import `test` and `expect` from here
 * instead of `@playwright/test` in every spec.
 */
export const test = base.extend({
  page: async ({ page }, provide) => {
    const goto = page.goto.bind(page);
    const reload = page.reload.bind(page);
    page.goto = async (...args: Parameters<Page['goto']>) => {
      const res = await goto(...args);
      await waitForStreamedSegments(page);
      return res;
    };
    page.reload = async (...args: Parameters<Page['reload']>) => {
      const res = await reload(...args);
      await waitForStreamedSegments(page);
      return res;
    };
    await provide(page);
  },
});

export { expect };
