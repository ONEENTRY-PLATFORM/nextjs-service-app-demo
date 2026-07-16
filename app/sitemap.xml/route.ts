import { getChildPagesByParentUrl } from '@/app/api';
import { getMastersList } from '@/app/api/utils/getMastersList';
import { getSiteUrl } from '@/app/utils/getSiteUrl';

/**
 * Generate sitemap.xml for the website
 * @returns {Promise<Response>} Response with XML content
 */
export async function GET(): Promise<Response> {
  const baseUrl = getSiteUrl();

  /** Get all pages for the sitemap */
  const staticPages = ['', 'services', 'gallery', 'masters', 'contacts'];

  /** Get dynamic service pages */
  const servicePages = await getChildPagesByParentUrl('services');
  const services =
    servicePages.pages?.map(
      (page: { pageUrl: string }) => `services/${page.pageUrl}`,
    ) || [];

  /** Get dynamic gallery pages */
  const galleryPages = await getChildPagesByParentUrl('gallery');
  const galleries =
    galleryPages.pages?.map(
      (page: { pageUrl: string }) => `gallery/${page.pageUrl}`,
    ) || [];

  /** Get master pages */
  const { admins } = await getMastersList();
  const masters =
    admins?.map((admin: { id: number }) => `masters/${admin.id}`) || [];

  /** Combine all paths */
  const allPaths = [...staticPages, ...services, ...galleries, ...masters];

  /** Generate sitemap XML */
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPaths
  .map(
    (path) => `  <url>
    <loc>${baseUrl}/${path}</loc>
    <changefreq>daily</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
