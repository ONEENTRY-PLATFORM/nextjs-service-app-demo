import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import { getChildPagesByParentUrl, getPageByUrl } from '@/app/api';
import { getAdminsInfo } from '@/app/api/server/admins/getAdminsInfo';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import MastersPageContent from '@/components/layout/masters-page';
import type {
  MasterItem,
  MastersMainCategory,
  SalonOption,
} from '@/components/layout/masters-page/taxonomy';
import { sectionOfRole } from '@/components/layout/masters-page/taxonomy';

import getLocalMasters, { LOCAL_SALONS } from './getLocalMasters';

/** Services child page `pageUrl` → main price-list category */
const CATEGORY_BY_PAGEURL: Record<string, MastersMainCategory> = {
  hair: 'HAIR',
  face: 'FACE',
  body: 'BODY',
  nails: 'NAILS',
};

/** CMS file attribute value shape (same as `SpecialistImage`) */
type FileLink = { default: string[] } | string;
type FileValue = Array<{
  previewLink?: FileLink;
  downloadLink?: FileLink;
}>;

/**
 * Extract a usable URL from a CMS file attribute value — tolerates both the
 * admin-entity shape (`{ default: string[] }`) and a plain string link.
 * @param   {unknown} value - Raw `attributeValues.<marker>.value`
 * @returns {string}        File URL or `''`
 */
const fileUrl = (value: unknown): string => {
  if (!Array.isArray(value) || value.length === 0) return '';
  const first = (value as FileValue)[0];
  const link = first?.previewLink ?? first?.downloadLink;
  if (!link) return '';
  if (typeof link === 'string') return link;
  return link.default[1] ?? link.default[0] ?? '';
};

/**
 * Map a CMS admin onto the normalized specialist shape of the masters page.
 * @param   {IAdminEntity}                     props                     - Function parameters
 * @param   {IAdminEntity}                     props.admin               - CMS admin entity
 * @param   {Map<number, MastersMainCategory>} props.categoryByServiceId - Services child page id → main category
 * @param   {Map<string, string>}              props.salonNameById       - Salon page id → salon title
 * @returns {MasterItem | null}                                          Normalized specialist or `null` when `master_name` is empty
 */
const toMasterItem = ({
  admin,
  categoryByServiceId,
  salonNameById,
}: {
  admin: IAdminEntity;
  categoryByServiceId: Map<number, MastersMainCategory>;
  salonNameById: Map<string, string>;
}): MasterItem | null => {
  const attrs = admin.attributeValues ?? {};
  const name = (attrs.master_name?.value as string | undefined) ?? '';
  if (!name) return null;

  /**
   * Service category links → main categories of the filter.
   * An `entity` attribute value is `[{ title, value: { id, parentId, … } }]`
   * (OneEntry `IListTitleEntityValue`) — the linked id lives in `value.id`.
   */
  const services = attrs.master_services?.value as
    | Array<{ value?: { id?: number | string; parentId?: number } }>
    | ''
    | undefined;
  /**
   * `master_services` links service PRODUCTS: `value.id` is a composite string
   * (`"p-<pageId>-<productId>"`), so the usable numeric page id is `value.parentId`
   * — the products' subcategory page, which maps to a main category.
   */
  const serviceParentIds = Array.isArray(services)
    ? services
        .map((service) => service.value?.parentId)
        .filter((id): id is number => typeof id === 'number')
    : [];
  const categories = Array.from(
    new Set(
      serviceParentIds
        .map((id) => categoryByServiceId.get(id))
        .filter((cat): cat is MastersMainCategory => Boolean(cat)),
    ),
  );

  /** Salon link → filter id + the salon suffix of the role line */
  const salonArr = attrs.master_salon?.value as
    Array<{ value?: { id?: number } }> | '' | undefined;
  const firstSalon = Array.isArray(salonArr) ? salonArr[0] : undefined;
  const salonId =
    firstSalon?.value?.id !== undefined ? String(firstSalon.value.id) : '';
  const salonName = salonNameById.get(salonId);

  const shortDescription =
    (attrs.master_short_description?.value as string | undefined) ||
    'Specialist';
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
    photo: fileUrl(attrs.master_image?.value),
    href:
      `/masters/${admin.id}` +
      (firstServiceId !== undefined ? `?service=${firstServiceId}` : ''),
  };
};

/**
 * Specialists page following the static-html mock (`MastersPage.tsx`):
 * gradient accent strip, salon / category / specialist filters and
 * profession card sections.
 *
 * Specialists come from CMS admins with `master_name` set (content plan,
 * stage 4). While none exist, the page falls back to the mock's demo roster
 * (`getLocalMasters`) so the design stays reviewable — the page never 404s
 * over missing masters.
 * @returns {Promise<JSX.Element>} Masters page
 */
const MastersPageLayout = async (): Promise<JSX.Element> => {
  /** All five reads are independent — fetch them in parallel to cut TTFB. */
  const [dict, { page, isError }, { admins }, servicesResult, salonsResult] =
    await Promise.all([
      getDictionary(),
      getPageByUrl('masters'),
      getAdminsInfo({ body: [], offset: 0, limit: 100 }),
      getChildPagesByParentUrl('services'),
      getChildPagesByParentUrl('salons'),
    ]);
  ServerProvider('dict', dict);

  if (!page || isError) {
    return notFound();
  }

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
    salonsResult.pages?.map((salonPage: IPagesEntity) => ({
      id: String(salonPage.id),
      name: salonPage.localizeInfos?.title ?? '',
      address:
        (salonPage.attributeValues?.salon_address?.value as string) ?? '',
    })) ?? [];
  const salonNameById = new Map(
    cmsSalons.map((salon) => [salon.id, salon.name]),
  );

  const cmsMasters =
    admins
      ?.map((admin: IAdminEntity) =>
        toMasterItem({ admin, categoryByServiceId, salonNameById }),
      )
      .filter((master): master is MasterItem => master !== null) ?? [];

  /** CMS data once stage 4 is filled; the mock's demo roster until then */
  const masters = cmsMasters.length > 0 ? cmsMasters : getLocalMasters();
  const salons = cmsMasters.length > 0 ? cmsSalons : LOCAL_SALONS;

  return (
    <div className="flex w-full flex-col bg-white">
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
  /** get page by Url */
  const { page, isError } = await getPageByUrl('masters');

  if (isError || !page) {
    return {};
  }

  /** extract data from page */
  const { localizeInfos } = page;

  return {
    title: localizeInfos?.title,
    description: localizeInfos?.title,
    openGraph: {
      type: 'article',
    },
  };
}
