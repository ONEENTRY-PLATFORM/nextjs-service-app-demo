import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// The Playwright runner does not read Next.js env files itself (unlike the
// webServer) — load them manually so process.env.E2E_* is defined in specs.
// This project keeps its variables in .env; .env.local wins when present
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // One local retry: the dev-mode webServer compiles routes on demand and can
  // time out under first-hit load; CI gets two retries
  retries: process.env.CI ? 2 : 1,
  // Few workers: parallel on-demand compilation + live OneEntry API calls
  // overwhelm `next dev` and cause goto timeouts
  workers: process.env.CI ? 1 : 3,
  reporter: 'html',
  // Centralized timeouts: routes compile on demand and every page waits on live
  // OneEntry calls, so the defaults (30s test / 5s expect) are too tight here.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    // Dedicated port: 3000 is often occupied by dev servers of OTHER projects,
    // and reuseExistingServer would silently run tests against a foreign app
    baseURL: 'http://localhost:3010',
    trace: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- -p 3010',
    url: 'http://localhost:3010',
    reuseExistingServer: !process.env.CI,
    // Next.js cold start can be long
    timeout: 120_000,
  },
});
