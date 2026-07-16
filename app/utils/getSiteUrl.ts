/**
 * Public origin of THIS site (not the CMS), for canonical/OG/JSON-LD URLs,
 * the sitemap and robots.
 *
 * SEO code historically built absolute URLs from `NEXT_PUBLIC_ONEENTRY_URL` —
 * the OneEntry CMS host — so every emitted link pointed at the CMS instead of
 * the site. The real origin lives in `NEXT_PUBLIC_VERCEL_URL` (the deployed
 * URL); `NEXT_PUBLIC_SITE_URL` is honoured first so a custom domain can override
 * it without touching code. The value is normalized: surrounding quotes (the
 * `.env` stores it quoted) and any trailing slash are stripped so callers can
 * safely append `/path`.
 * @returns {string} Site origin without a trailing slash, e.g. `https://example.com`
 */
export const getSiteUrl = (): string => {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    'http://localhost:3700';
  return raw
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\/+$/, '');
};
