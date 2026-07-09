/**
 * Generate robots.txt for the website
 * @returns {Promise<Response>} Response with robots.txt content
 */
export async function GET(): Promise<Response> {
  const baseUrl =
    process.env.NEXT_PUBLIC_ONEENTRY_URL || 'https://oneentry.cloud';

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
