import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';

import { getChildPagesByParentUrl } from '@/app/api/server/pages/getChildPagesByParentUrl';
import { getProductsByPageUrl } from '@/app/api/server/products/getProductsByPageUrl';
import type {
  ServiceItem,
  ServicesCategory,
  ServicesSalon,
} from '@/components/layout/services-page/types';
import { isOfferProduct } from '@/components/utils/isOfferProduct';
import { plainTextFromTextAttr } from '@/components/utils/plainTextFromTextAttr';
import productDurationMinutes from '@/components/utils/productDurationMinutes';
import { salonFromPage } from '@/components/utils/salonFromPage';

/** Page size of a single catalog products request. */
const PAGE_LIMIT = 100;

/**
 * Fetch every product of a catalog page, following the pagination.
 *
 * One request is capped at {@link PAGE_LIMIT} items while the API reports the
 * real `total`, so keep paging until the whole page is collected — stopping at
 * the first response would silently drop services once a category outgrows the
 * limit. A failed request yields no products and ends the loop, leaving the
 * category to render with whatever was already fetched.
 * @param   {string}                     handle - Catalog page marker (`pageUrl` from the CMS)
 * @returns {Promise<IProductsEntity[]>}        Every product linked to the page
 */
const fetchAllProducts = async (handle: string): Promise<IProductsEntity[]> => {
  const all: IProductsEntity[] = [];
  let offset = 0;

  for (;;) {
    const { products, total } = await getProductsByPageUrl({
      limit: PAGE_LIMIT,
      offset,
      params: { handle },
    });

    const page = products ?? [];
    all.push(...page);
    offset += PAGE_LIMIT;

    /** Done once the reported total is covered (or the API ran dry). */
    if (page.length < 1 || all.length >= total) {
      break;
    }
  }

  return all;
};

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
  const attrs: IAttributeValues = product.attributeValues ?? {};

  /** Price: the top-level product price, or the `price` attribute */
  const attrPrice = attrs.price?.value;
  const price =
    typeof product.price === 'number'
      ? product.price
      : typeof attrPrice === 'number'
        ? attrPrice
        : null;

  /** Duration in minutes: `duration` or `time` attribute, number or numeric string */
  const duration = productDurationMinutes(attrs);

  /**
   * Short description: the `description` text attribute, whose `value` is a
   * `[{ htmlValue, plainValue }]` array rather than a string.
   *
   * There is no `localizeInfos` fallback on purpose: a product's `localizeInfos`
   * carries only `title` at runtime (verified against the live CMS), so reading
   * `plainValue`/`plainContent` off it can never yield anything. The SDK's
   * `ILocalizeInfo` type declares those fields, which is why such a fallback
   * looks plausible and type-checks while being dead.
   */
  const description = plainTextFromTextAttr(attrs.description?.value) || '';

  /**
   * Currency of `price`, from the product's own `currency` attribute (flagged
   * `isCurrency` in the CMS attribute set). Rendered by `CurrencySymbol` — the
   * dirham glyph is no longer assumed.
   */
  const attrCurrency = attrs.currency?.value;
  const currency = typeof attrCurrency === 'string' ? attrCurrency : '';

  return {
    id: product.id,
    title: product.localizeInfos?.title ?? '',
    description,
    price,
    currency,
    statusIdentifier: product.statusIdentifier ?? '',
    duration,
    categoryUrl: category.pageUrl,
    categoryId: category.id,
    subcategoryUrl,
  };
};

/**
 * Collect everything the services page catalog needs from the CMS: the
 * category tree under the `services` page, the salons list and the flat list
 * of plain services (products; `offer` products are special offers and
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

  const salons: ServicesSalon[] = (salonsResult.pages ?? []).map(
    (salonPage) => {
      const salon = salonFromPage(salonPage);
      return {
        url: salon.url,
        id: salon.id,
        title: salon.name,
        address: salon.address,
      };
    },
  );

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
          fetchAllProducts(sub.pageUrl).then((products) => ({
            subcategoryUrl: sub.pageUrl,
            products,
          })),
        ),
        fetchAllProducts(categoryPage.pageUrl).then((products) => ({
          subcategoryUrl: null as string | null,
          products,
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
          /** Special offers (`offer`) belong to the offers page */
          if (isOfferProduct(product) || seen.has(product.id)) {
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
