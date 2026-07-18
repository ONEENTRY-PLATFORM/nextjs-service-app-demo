import { getSiteUrl } from '@/app/utils/getSiteUrl';

/**
 * `getSiteUrl` reads `process.env` on every call, so no module reset is needed —
 * only a save/restore of the two variables it consults. next/jest may load them
 * from `.env`, hence the explicit delete before the fallback case.
 */
describe('getSiteUrl', () => {
  const KEYS = ['NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_VERCEL_URL'] as const;
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    KEYS.forEach((key) => {
      saved[key] = process.env[key];
      delete process.env[key];
    });
  });

  afterEach(() => {
    KEYS.forEach((key) => {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    });
  });

  it('prefers NEXT_PUBLIC_SITE_URL over the Vercel URL', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://thalia.ae';
    process.env.NEXT_PUBLIC_VERCEL_URL = 'https://preview.vercel.app';

    expect(getSiteUrl()).toBe('https://thalia.ae');
  });

  it('falls back to the Vercel URL when the site URL is unset', () => {
    process.env.NEXT_PUBLIC_VERCEL_URL = 'https://preview.vercel.app';

    expect(getSiteUrl()).toBe('https://preview.vercel.app');
  });

  it('falls back to localhost:3700 when neither is set', () => {
    expect(getSiteUrl()).toBe('http://localhost:3700');
  });

  it('strips surrounding quotes and a trailing slash so /path can be appended', () => {
    process.env.NEXT_PUBLIC_SITE_URL = '"https://thalia.ae/"';

    expect(getSiteUrl()).toBe('https://thalia.ae');
  });

  it('strips several trailing slashes and surrounding whitespace', () => {
    process.env.NEXT_PUBLIC_SITE_URL = '  https://thalia.ae///  ';

    expect(getSiteUrl()).toBe('https://thalia.ae');
  });
});
