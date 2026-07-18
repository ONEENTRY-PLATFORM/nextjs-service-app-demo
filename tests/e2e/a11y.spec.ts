import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Accessibility smoke over the key public pages with axe-core (WCAG 2.0/2.1 A/AA).
// The bar is "no CRITICAL violations" — critical issues (missing form labels,
// non-unique landmarks, severe contrast) block real users; the full violation
// list is attached to every run for triage of lower-severity findings.
const PAGES = [
  { name: 'home', url: '/' },
  { name: 'services', url: '/services' },
  { name: 'masters', url: '/masters' },
  { name: 'offers', url: '/offers' },
  { name: 'contacts', url: '/contacts' },
  { name: 'booking', url: '/booking' },
];

for (const { name, url } of PAGES) {
  test(`a11y: ${name} has no critical accessibility violations`, async ({
    page,
  }, testInfo) => {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => undefined);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Attach the full violation set so non-critical issues are visible on green runs
    await testInfo.attach('axe-violations.json', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });

    const critical = results.violations.filter((v) => v.impact === 'critical');
    const detail = critical
      .map((v) => `${v.id} (${v.nodes.length}×): ${v.help}`)
      .join('\n');
    expect(critical, `Critical a11y violations on ${url}:\n${detail}`).toEqual(
      [],
    );
  });
}
