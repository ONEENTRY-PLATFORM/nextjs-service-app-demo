import { getSiteUrl } from '@/app/utils/getSiteUrl';
/**
 * Generate robots.txt for the website
 * @returns {Promise<Response>} Response with robots.txt content
 */
export async function GET(): Promise<Response> {
  const baseUrl = getSiteUrl();

  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
