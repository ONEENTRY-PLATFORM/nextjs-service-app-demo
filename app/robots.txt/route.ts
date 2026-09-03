import { getSiteUrl } from '@/app/utils/getSiteUrl';
/**
 * Generate robots.txt for the website
 * @returns {Promise<Response>} Response with robots.txt content
 */
export async function GET(): Promise<Response> {
  const baseUrl = getSiteUrl();

  /**
   * The file used to be `Allow: /` and nothing else, so the private and
   * diagnostic routes were openly advertised to every crawler.
   *
   * `/booking` is deliberately NOT listed: it is the public appointment funnel
   * and one of the pages the site most wants indexed. Only routes that either
   * require a session or exist for diagnostics are closed.
   */
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /api-test
Disallow: /profile
Disallow: /auth/

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
