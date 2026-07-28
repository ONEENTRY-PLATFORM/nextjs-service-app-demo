import type { Metadata } from 'next';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import { getChildPagesByParentUrl } from '@/app/api/server/pages/getChildPagesByParentUrl';
import { getPageByUrl } from '@/app/api/server/pages/getPageByUrl';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { getMastersList } from '@/app/api/utils/getMastersList';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { cmsPageMetadata } from '@/app/utils/cmsPageMetadata';
import MastersPageContent from '@/components/layout/masters-page';
import type {
  MasterItem,
  MastersMainCategory,
  SalonOption,
} from '@/components/layout/masters-page/taxonomy';
import { sectionOfRole } from '@/components/layout/masters-page/taxonomy';
import { dictText } from '@/components/utils/dictText';
import { entityLinks, entityPageIds } from '@/components/utils/entityLinks';
import { fileBlurDataUrl } from '@/components/utils/fileBlurDataUrl';
import { fileDisplayUrl } from '@/components/utils/fileDisplayUrl';
import { salonFromPage } from '@/components/utils/salonFromPage';
import { salonLabel } from '@/components/utils/salonLabel';

/**
 * CMS content is the same for everyone — prerender this route and refresh it
 * on a timer (ISR) instead of rendering it per request.
 */
export const dynamic = 'force-static';
export const revalidate = 60;

/** Services child page `pageUrl` → main price-list category */
const CATEGORY_BY_PAGEURL: Record<string, MastersMainCategory> = {
  hair: 'HAIR',
  face: 'FACE',
  body: 'BODY',
  nails: 'NAILS',
};

/**
 * Map a CMS admin onto the normalized specialist shape of the masters page.
 * @param   {IAdminEntity}                     props                     - Function parameters
 * @param   {IAdminEntity}                     props.admin               - CMS admin entity
 * @param   {Map<number, MastersMainCategory>} props.categoryByServiceId - Services child page id → main category
 * @param   {Map<number, string>}              props.salonNameById       - Salon page id → salon title
 * @param   {string}                           props.specialistText      - Role fallback when `master_short_description` is empty
 * @returns {MasterItem | null}                                          Normalized specialist or `null` when `master_name` is empty
 */
const toMasterItem = ({
  admin,
  categoryByServiceId,
  salonNameById,
  specialistText,
}: {
  admin: IAdminEntity;
  categoryByServiceId: Map<number, MastersMainCategory>;
  salonNameById: Map<number, string>;
  specialistText: string;
}): MasterItem | null => {
  const attrs = admin.attributeValues ?? {};
  const name = (attrs.master_name?.value as string | undefined) ?? '';
  if (!name) return null;

  /**
   * Service category links → main categories of the filter.
   *
   * `master_services` links service PRODUCTS: `value.id` is a composite string
   * (`"p-<pageId>-<productId>"`), so the usable numeric page id is `value.parentId`
   * — the products' subcategory page, which maps to a main category.
   */
  const serviceParentIds = entityLinks(attrs.master_services?.value)
    .map((link) => link.parentId)
    .filter((id): id is number => typeof id === 'number');
  const categories = Array.from(
    new Set(
      serviceParentIds
        .map((id) => categoryByServiceId.get(id))
        .filter((cat): cat is MastersMainCategory => Boolean(cat)),
    ),
  );

  /** Salon link → filter id + the salon suffix of the role line */
  const salonId = entityPageIds(attrs.master_salon?.value)[0] ?? null;
  const salonName =
    salonId !== null ? salonLabel(salonNameById.get(salonId)) : '';

  const shortDescription =
    (attrs.master_short_description?.value as string | undefined) ||
    specialistText;
  const firstServiceId = serviceParentIds[0];

  return {
    id: String(admin.id),
    name,
    role: salonName ? `${shortDescription} · ${salonName}` : shortDescription,
    section: sectionOfRole(shortDescription),
    /** A master without service links stays visible under every category */
    categories:
      categories.length > 0 ? categories : ['HAIR', 'FACE', 'BODY', 'NAILS'],
    salonId,
    rating: Number(attrs.master_rating?.value) || 5,
    photo: fileDisplayUrl(attrs.master_image?.value),
    photoBlur: fileBlurDataUrl(attrs.master_image?.value),
    href:
      `/masters/${admin.id}` +
      (firstServiceId !== undefined ? `?service=${firstServiceId}` : ''),
  };
};

/**
 * Specialists page.
 *
 * Specialists come from CMS admins with `master_name` set (content plan,
 * stage 4). When none exist the page degrades to empty filters and sections
 * rather than 404-ing over missing masters.
 * @returns {Promise<JSX.Element>} Masters page
 */
const MastersPageLayout = async (): Promise<JSX.Element> => {
  /** All five reads are independent — fetch them in parallel to cut TTFB. */
  const [dict, { admins }, servicesResult, salonsResult, pageResult] =
    await Promise.all([
      getDictionary(),
      getMastersList(),
      getChildPagesByParentUrl('services'),
      getChildPagesByParentUrl('salons'),
      getPageByUrl('masters'),
    ]);
  ServerProvider('dict', dict);

  /**
   * The `masters` page entity feeds only the (visually hidden) `h1` — the body
   * renders the admin roster and the service/salon filter options — so it is
   * never gated on: a transient CMS failure or an unpopulated page degrades to
   * the fallback heading and empty filters instead of 404-ing over missing
   * masters. `getPageByUrl` reports failures in its envelope, it never throws.
   */
  const heading = pageResult.page?.localizeInfos?.title || 'Specialists';

  /**
   * Service page id → main category. Keyed by BOTH the 4 main category pages
   * and their subcategory children, because `master_services` references
   * products whose `value.parentId` is a subcategory page id.
   */
  const categoryByServiceId = new Map<number, MastersMainCategory>();
  const mainCats = (servicesResult.pages ?? []).filter(
    (sp: IPagesEntity) => CATEGORY_BY_PAGEURL[sp.pageUrl],
  );
  mainCats.forEach((sp: IPagesEntity) => {
    const cat = CATEGORY_BY_PAGEURL[sp.pageUrl];
    if (cat) categoryByServiceId.set(sp.id, cat);
  });
  /** Map each subcategory (child of a main category) to that main category. */
  const subcatGroups = await Promise.all(
    mainCats.map(async (sp: IPagesEntity) => ({
      cat: CATEGORY_BY_PAGEURL[sp.pageUrl],
      children: (await getChildPagesByParentUrl(sp.pageUrl)).pages,
    })),
  );
  subcatGroups.forEach(({ cat, children }) => {
    if (!cat) return;
    children?.forEach((c: IPagesEntity) => categoryByServiceId.set(c.id, cat));
  });

  /** Salon filter options from the CMS salon pages */
  const cmsSalons: SalonOption[] =
    salonsResult.pages?.map((salonPage: IPagesEntity) => {
      const salon = salonFromPage(salonPage);
      return { id: salon.id, name: salon.name, address: salon.address };
    }) ?? [];
  const salonNameById = new Map(
    cmsSalons.map((salon) => [salon.id, salon.name]),
  );

  const specialistText = dictText(dict, 'specialist_text', 'Specialist');
  const cmsMasters =
    admins
      ?.map((admin: IAdminEntity) =>
        toMasterItem({
          admin,
          categoryByServiceId,
          salonNameById,
          specialistText,
        }),
      )
      .filter((master): master is MasterItem => master !== null) ?? [];

  /** Masters and salon filter options come straight from the CMS. */
  const masters = cmsMasters;
  const salons = cmsSalons;

  return (
    <div className="flex w-full flex-col bg-white">
      {/* The design opens with the filter bar — the h1 is for a11y/SEO only */}
      <h1 className="sr-only">{heading}</h1>
      {/* Gradient accent strip */}
      <div className="h-1.25 bg-gradient-stats" />
      <MastersPageContent masters={masters} salons={salons} />
    </div>
  );
};

export default MastersPageLayout;

/**
 * Generate page metadata
 * @async
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 * @returns {Promise<JSX.Element>} metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  return cmsPageMetadata({
    pageUrl: 'masters',
    path: '/masters',
  });
}
