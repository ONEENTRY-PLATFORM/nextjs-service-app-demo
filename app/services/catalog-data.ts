import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';

import { getChildPagesByParentUrl, getProductsByPageUrl } from '@/app/api';
import type {
  ServiceItem,
  ServicesCategory,
  ServicesSalon,
} from '@/components/layout/services-page/types';

/**
 * Map a CMS product entity to a plain serializable service item.
 *
 * Attribute markers are read defensively — while the CMS is not fully filled
 * the attributes may be missing entirely, so every field degrades to a safe
 * fallback (`null` price renders as "Not available").
 * @param   {IProductsEntity} product        - Product entity from the OneEntry Products API
 * @param   {IPagesEntity}    category       - Category page the product belongs to
 * @param   {string | null}   subcategoryUrl - `pageUrl` of the subcategory the product was fetched from
 * @returns {ServiceItem}                    Plain service item for the client catalog
 */
const toServiceItem = (
  product: IProductsEntity,
  category: IPagesEntity,
  subcategoryUrl: string | null,
): ServiceItem => {
  const attrs = (product.attributeValues ?? {}) as Record<
    string,
    { value?: unknown } | undefined
  >;

  /** Price: the top-level product price, or the `price` attribute */
  const attrPrice = attrs.price?.value;
  const price =
    typeof product.price === 'number'
      ? product.price
      : typeof attrPrice === 'number'
        ? attrPrice
        : null;

  /** Duration in minutes: `duration` or `time` attribute, number or numeric string */
  const rawDuration = attrs.duration?.value ?? attrs.time?.value;
  const duration =
    typeof rawDuration === 'number'
      ? rawDuration
      : typeof rawDuration === 'string' &&
          rawDuration.trim() !== '' &&
          !Number.isNaN(Number(rawDuration))
        ? Number(rawDuration)
        : null;

  /** Short description: `description` attribute or the localized plain value */
  const attrDescription = attrs.description?.value;
  const description =
    typeof attrDescription === 'string'
      ? attrDescription
      : typeof product.localizeInfos?.plainValue === 'string'
        ? product.localizeInfos.plainValue
        : '';

  return {
    id: product.id,
    title: product.localizeInfos?.title ?? '',
    description,
    price,
    duration,
    categoryUrl: category.pageUrl,
    categoryId: category.id,
    subcategoryUrl,
  };
};

/**
 * Collect everything the services page catalog needs from the CMS: the
 * category tree under the `services` page, the salons list and the flat list
 * of plain services (products; `service_set` products are special offers and
 * are excluded — they live on the offers page).
 *
 * Every fetch failure degrades to an empty list so the page renders with
 * whatever the CMS currently has.
 * @returns {Promise<object>} Categories with subcategories, salons and services
 */
export const getServicesCatalogData = async (): Promise<{
  categories: ServicesCategory[];
  salons: ServicesSalon[];
  services: ServiceItem[];
}> => {
  /** Category pages and salons are independent — fetch in parallel */
  const [categoriesResult, salonsResult] = await Promise.all([
    getChildPagesByParentUrl('services'),
    getChildPagesByParentUrl('salons'),
  ]);

  const salons: ServicesSalon[] = (salonsResult.pages ?? []).map((salon) => ({
    url: salon.pageUrl,
    title: salon.localizeInfos?.title ?? salon.pageUrl,
    address:
      typeof salon.attributeValues?.salon_address?.value === 'string'
        ? salon.attributeValues.salon_address.value
        : '',
  }));

  const categoryPages = categoriesResult.pages ?? [];

  /** Per-category buckets keep the CMS order stable despite Promise.all */
  const buckets = await Promise.all(
    categoryPages.map(async (categoryPage) => {
      const { pages: subPages } = await getChildPagesByParentUrl(
        categoryPage.pageUrl,
      );
      const subcategories = subPages ?? [];

      /** Products of every subcategory plus the category page itself */
      const lists = await Promise.all([
        ...subcategories.map((sub) =>
          getProductsByPageUrl({
            limit: 100,
            offset: 0,
            params: { handle: sub.pageUrl },
          }).then((result) => ({
            subcategoryUrl: sub.pageUrl,
            products: result.products ?? [],
          })),
        ),
        getProductsByPageUrl({
          limit: 100,
          offset: 0,
          params: { handle: categoryPage.pageUrl },
        }).then((result) => ({
          subcategoryUrl: null as string | null,
          products: result.products ?? [],
        })),
      ]);

      /**
       * Subcategory lists are processed first, so when a product shows up
       * both on its subcategory and on the parent category page it keeps
       * the more specific subcategory association.
       */
      const seen = new Set<number>();
      const services: ServiceItem[] = [];
      for (const { subcategoryUrl, products } of lists) {
        for (const product of products) {
          /** Special offers (`service_set`) belong to the offers page */
          if (
            product.attributeSetIdentifier === 'service_set' ||
            seen.has(product.id)
          ) {
            continue;
          }
          seen.add(product.id);
          services.push(toServiceItem(product, categoryPage, subcategoryUrl));
        }
      }

      const category: ServicesCategory = {
        url: categoryPage.pageUrl,
        id: categoryPage.id,
        title: categoryPage.localizeInfos?.title ?? categoryPage.pageUrl,
        subcategories: subcategories.map((sub) => ({
          url: sub.pageUrl,
          title: sub.localizeInfos?.title ?? sub.pageUrl,
        })),
      };

      return { category, services };
    }),
  );

  return {
    categories: buckets.map((bucket) => bucket.category),
    salons,
    services: buckets.flatMap((bucket) => bucket.services),
  };
};
