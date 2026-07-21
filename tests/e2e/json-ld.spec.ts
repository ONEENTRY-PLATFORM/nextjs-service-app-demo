import { expect, type Page, test } from '@playwright/test';

// Structured data (JSON-LD) is emitted inline on five surfaces: the root layout
// (Organization, on every page), the home page (WebSite) and the three detail
// routes — masters/[handle] (Person), gallery/[handle] (ImageGallery) and
// services/[handle] (Service). All go through `serializeJsonLd`, which escapes
// `<`/`>`/`&` so a CMS-authored value carrying a literal `</script>` cannot break
// out of the tag (stored-XSS guard, MISMATCH-LOG §5.5). These specs prove every
// block is break-out-safe, parses as valid JSON, and carries the expected @type.

/**
 * Read every inline JSON-LD block on the page, assert each is break-out-safe and
 * valid JSON, and return the parsed objects.
 * @param   {Page}                               page - Playwright page
 * @returns {Promise<Record<string, unknown>[]>}      Parsed JSON-LD objects
 */
const readJsonLd = async (page: Page): Promise<Record<string, unknown>[]> => {
  const scripts = page.locator('script[type="application/ld+json"]');
  await expect(scripts.first()).toBeAttached({ timeout: 30_000 });

  const raw = await scripts.evaluateAll((nodes) =>
    nodes.map((n) => n.textContent ?? ''),
  );

  return raw.map((text) => {
    // serializeJsonLd escapes every '<' to its \\u003c unicode form, so a
    // correctly emitted block carries NO literal '<' in the DOM text — the
    // `</script>` break-out that would let a CMS value run as HTML is impossible.
    expect(
      text,
      'JSON-LD must be break-out escaped (no literal <)',
    ).not.toContain('<');
    // Complete + valid: a broken-out tag would have truncated this → throw
    const parsed = JSON.parse(text) as Record<string, unknown>;
    // Every typed block declares the schema.org context
    if (typeof parsed['@type'] === 'string') {
      expect(parsed['@context']).toBe('https://schema.org');
    }
    return parsed;
  });
};

/**
 * Collect the type values across all JSON-LD blocks on the page.
 * @param   {Record<string, unknown>[]} blocks - Parsed JSON-LD objects
 * @returns {string[]}                         The type strings found
 */
const typesOf = (blocks: Record<string, unknown>[]): string[] =>
  blocks
    .map((b) => b['@type'])
    .filter((t): t is string => typeof t === 'string');

test.describe('JSON-LD structured data', () => {
  test('home emits Organization + WebSite, both escaped and valid', async ({
    page,
  }) => {
    await page.goto('/');
    const blocks = await readJsonLd(page);
    const types = typesOf(blocks);

    // Organization comes from the root layout, WebSite from the home page
    expect(types).toContain('Organization');
    expect(types).toContain('WebSite');
  });

  test('a gallery category emits ImageGallery', async ({ page }) => {
    await page.goto('/gallery/gallery-hair');
    await expect(page.getByTestId('gallery-page')).toBeVisible({
      timeout: 30_000,
    });

    expect(typesOf(await readJsonLd(page))).toContain('ImageGallery');
  });

  test('a master profile emits Person', async ({ page }) => {
    // Resolve a real master id from the grid rather than hardcoding one
    await page.goto('/masters');
    const card = page
      .getByTestId('masters-page')
      .getByTestId('master-card')
      .first();
    await expect(card).toBeAttached({ timeout: 30_000 });
    const href = await card.getAttribute('href');
    expect(href).toMatch(/^\/masters\/\d+/);

    await page.goto(href as string);
    // `.first()`: a route transition can momentarily mount the section twice
    // under load — scope to one to avoid a strict-mode violation
    await expect(page.getByTestId('master-page').first()).toBeAttached({
      timeout: 30_000,
    });

    expect(typesOf(await readJsonLd(page))).toContain('Person');
  });

  test('a service category emits Service', async ({ page }) => {
    test.setTimeout(90_000);

    // Collect a real /services/<category> href from the home catalog tiles
    await page.goto('/');
    const tiles = page.getByTestId('home-catalog').getByTestId('catalog-card');
    await expect(tiles.first()).toBeAttached({ timeout: 30_000 });
    const hrefs = await tiles.evaluateAll((els) => [
      ...new Set(els.map((el) => el.getAttribute('href') || '')),
    ]);
    const serviceHref = hrefs.find((h) => h.startsWith('/services/'));
    test.skip(!serviceHref, 'no service category tile on the home catalog');

    await page.goto(serviceHref as string);
    await expect(page.getByTestId('services-catalog')).toBeAttached({
      timeout: 30_000,
    });

    expect(typesOf(await readJsonLd(page))).toContain('Service');
  });
});
