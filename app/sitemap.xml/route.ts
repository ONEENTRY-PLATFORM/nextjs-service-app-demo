import { getChildPagesByParentUrl } from '@/app/api/server/pages/getChildPagesByParentUrl';
import { getMastersList } from '@/app/api/utils/getMastersList';
import { getSiteUrl } from '@/app/utils/getSiteUrl';

/**
 * Generate sitemap.xml for the website
 * @returns {Promise<Response>} Response with XML content
 */
export async function GET(): Promise<Response> {
  const baseUrl = getSiteUrl();

  /**
   * Public routes with no CMS children of their own. `offers` and `reviews`
   * were missing, so two live pages were never advertised to crawlers.
   *
   * Not derived from `app/utils/constants.ts` on purpose: that table lists CMS
   * MARKERS, not Next routes — it has no `offers`/`reviews` at all and does have
   * `profile` and `404`, which must never appear here.
   */
  const staticPages = [
    '',
    'services',
    'gallery',
    'masters',
    'offers',
    'reviews',
    'contacts',
  ];

  /** The four child-page reads are independent — fetch them in parallel. */
  const [servicePages, galleryPages, salonPages, { admins }] =
    await Promise.all([
      getChildPagesByParentUrl('services'),
      getChildPagesByParentUrl('gallery'),
      getChildPagesByParentUrl('salons'),
      getMastersList(),
    ]);

  /**
   * Service categories AND their subcategories. `/services/[handle]` pre-renders
   * both (see its `generateStaticParams`), but the sitemap listed only the four
   * top-level categories — the 16 subcategory pages were never advertised.
   */
  const serviceCategories = servicePages.pages ?? [];
  const subLists = await Promise.all(
    serviceCategories.map((category) =>
      getChildPagesByParentUrl(category.pageUrl),
    ),
  );
  const services = serviceCategories.flatMap((category, index) => [
    `services/${category.pageUrl}`,
    ...(subLists[index]?.pages?.map(
      (sub: { pageUrl: string }) => `services/${sub.pageUrl}`,
    ) ?? []),
  ]);

  const galleries =
    galleryPages.pages?.map(
      (page: { pageUrl: string }) => `gallery/${page.pageUrl}`,
    ) || [];

  /** Salon detail pages — a whole prerendered route group that was omitted. */
  const salons =
    salonPages.pages?.map(
      (page: { pageUrl: string }) => `salons/${page.pageUrl}`,
    ) || [];

  const masters =
    admins?.map((admin: { id: number }) => `masters/${admin.id}`) || [];

  /** Combine all paths */
  const allPaths = [
    ...staticPages,
    ...services,
    ...galleries,
    ...salons,
    ...masters,
  ];

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
