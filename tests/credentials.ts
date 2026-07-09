/**
 * Central test credentials for both Jest and Playwright suites.
 *
 * Values come from environment variables (loaded from `.env` / `.env.local`
 * by playwright.config.ts and next/jest). NEVER commit real values here —
 * set them locally or in CI secrets:
 *
 * ```env
 * E2E_USER_EMAIL=test-user@example.com
 * E2E_USER_PASSWORD=********
 * ```
 *
 * Tests that need an authorized session should skip when the credentials
 * are not provided:
 *
 * ```typescript
 * test.skip(!credentials.email, 'E2E_USER_EMAIL is not set');
 * ```
 */
export const credentials = {
  email: process.env.E2E_USER_EMAIL || '',
  password: process.env.E2E_USER_PASSWORD || '',
};
