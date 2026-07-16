import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';

import { getChildPagesByParentUrl } from '@/app/api';
import { getMastersList } from '@/app/api/utils/getMastersList';
import { getServicesCatalogData } from '@/app/services/catalog-data';
import type {
  BookingData,
  BookingMaster,
  BookingSalon,
  BookingService,
} from '@/components/layout/booking-page/types';
import {
  fileBlurDataUrl,
  fileDisplayUrl,
  formatUaePhone,
  plainTextFromTextAttr,
} from '@/components/utils';

/** Services child page `pageUrl` → display category of the wizard pills */
const CATEGORY_BY_PAGEURL: Record<string, string> = {
  hair: 'Hair',
  face: 'Face',
  body: 'Body',
  nails: 'Nails',
};

/**
 * Parse the admin's `services` attribute links: numeric entries are services
 * category pages, composite `p-<parentId>-<productId>` strings are products.
 * @param   {unknown} value - Raw `attributeValues.services.value`
 * @returns {object}        Category page ids and product ids of the links
 */
const parseServiceLinks = (
  value: unknown,
): { categoryPageIds: number[]; productIds: number[] } => {
  const categoryPageIds: number[] = [];
  const productIds: number[] = [];
  if (!Array.isArray(value)) {
    return { categoryPageIds, productIds };
  }
  // An `entity` value is `[{ title, value: { id, parentId, … } }]`
  // (OneEntry `IListTitleEntityValue`) — the linked id lives in `value.id`.
  for (const entry of value as Array<{ value?: { id?: number | string } }>) {
    const raw = entry?.value?.id;
    if (typeof raw === 'number') {
      categoryPageIds.push(raw);
    } else if (typeof raw === 'string' && raw.startsWith('p-')) {
      const productId = Number(raw.split('-')[2]);
      if (productId) productIds.push(productId);
    }
  }
  return { categoryPageIds, productIds };
};

/**
 * Map a CMS admin onto the normalized specialist shape of the wizard.
 * @param   {object}                      props                  - Function parameters
 * @param   {IAdminEntity}                props.admin            - CMS admin entity
 * @param   {Map<number, string>}         props.categoryByPageId - Services child page id → display category
 * @param   {Map<string, BookingService>} props.serviceById      - Wizard service by id
 * @returns {BookingMaster | null}                               Normalized specialist or `null` when `master_name` is empty
 */
const toBookingMaster = ({
  admin,
  categoryByPageId,
  serviceById,
}: {
  admin: IAdminEntity;
  categoryByPageId: Map<number, string>;
  serviceById: Map<string, BookingService>;
}): BookingMaster | null => {
  const attrs = admin.attributeValues ?? {};
  const name = (attrs.master_name?.value as string | undefined) ?? '';
  if (!name) return null;

  const { categoryPageIds, productIds } = parseServiceLinks(
    attrs.master_services?.value,
  );
  const serviceIds = productIds
    .map((id) => String(id))
    .filter((id) => serviceById.has(id));

  /** Specialties line: categories of the linked products, then of the pages */
  const fromProducts = serviceIds
    .map((id) => serviceById.get(id)?.category)
    .filter((c): c is string => Boolean(c));
  const fromPages = categoryPageIds
    .map((id) => categoryByPageId.get(id))
    .filter((c): c is string => Boolean(c));
  const specialties = Array.from(
    new Set(fromProducts.length > 0 ? fromProducts : fromPages),
  );

  const salonArr = attrs.master_salon?.value as
    Array<{ value?: { id?: number } }> | '' | undefined;
  const salonIds = Array.isArray(salonArr)
    ? salonArr
        .map((s) => (s?.value?.id !== undefined ? String(s.value.id) : ''))
        .filter(Boolean)
    : [];

  /** "from" price — the cheapest linked service */
  const prices = serviceIds
    .map((id) => serviceById.get(id)?.price)
    .filter((v): v is number => typeof v === 'number');

  const shortDescription = attrs.master_short_description?.value;

  return {
    id: String(admin.id),
    adminId: admin.id,
    name,
    grade: typeof shortDescription === 'string' ? shortDescription : '',
    photo: fileDisplayUrl(attrs.master_image?.value),
    photoBlur: fileBlurDataUrl(attrs.master_image?.value),
    specialties,
    rating: Number(attrs.master_rating?.value) || 5,
    reviews: null,
    price: prices.length ? Math.min(...prices) : null,
    bio: plainTextFromTextAttr(attrs.master_description?.value),
    salonIds,
    serviceIds,
  };
};

/**
 * Collect everything the booking wizard needs from the CMS: the salons (with
 * address and phone), the bookable services (products of the services tree,
 * reusing the services page catalog collector) and the specialists (admins
 * with `master_name`).
 *
 * When the CMS is missing services, specialists or salons the wizard simply
 * renders the empty steps rather than showing fabricated data.
 * @returns {Promise<BookingData>} Wizard payload from the CMS
 */
export const getBookingData = async (): Promise<BookingData> => {
  /** The three sources are independent — fetch in parallel */
  const [catalog, salonsResult, adminsResult] = await Promise.all([
    getServicesCatalogData(),
    getChildPagesByParentUrl('salons'),
    getMastersList(),
  ]);

  const salons: BookingSalon[] = (salonsResult.pages ?? []).map(
    (salonPage: IPagesEntity) => {
      const attrs = salonPage.attributeValues ?? {};
      const phone = attrs.salon_phone?.value;
      return {
        id: String(salonPage.id),
        name: salonPage.localizeInfos?.title ?? salonPage.pageUrl,
        address:
          typeof attrs.salon_address?.value === 'string'
            ? attrs.salon_address.value
            : '',
        phone: typeof phone === 'string' ? formatUaePhone(phone) : '',
      };
    },
  );

  /** Services child page id → display category (matched by `pageUrl`) */
  const categoryByPageId = new Map<number, string>();
  catalog.categories.forEach((cat) => {
    categoryByPageId.set(cat.id, CATEGORY_BY_PAGEURL[cat.url] ?? cat.title);
  });

  const services: BookingService[] = catalog.services.map((item) => ({
    id: String(item.id),
    category:
      CATEGORY_BY_PAGEURL[item.categoryUrl] ??
      catalog.categories.find((c) => c.url === item.categoryUrl)?.title ??
      item.categoryUrl,
    name: item.title,
    duration: item.duration !== null ? `${item.duration} min` : '',
    price: item.price,
    productId: item.id,
    categoryId: item.categoryId,
  }));
  const serviceById = new Map(services.map((s) => [s.id, s]));

  const masters: BookingMaster[] = (adminsResult.admins ?? [])
    .map((admin: IAdminEntity) =>
      toBookingMaster({ admin, categoryByPageId, serviceById }),
    )
    .filter((m): m is BookingMaster => m !== null);

  return { salons, services, masters };
};
