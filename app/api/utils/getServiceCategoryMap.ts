import 'server-only';

import type { IPagesEntity } from 'oneentry/types';
import { cache } from 'react';

import { getChildPagesByParentUrl } from '@/app/api/server/pages/getChildPagesByParentUrl';
import type { MastersMainCategory } from '@/components/layout/masters-page/taxonomy';

/** Services child page `pageUrl` → main price-list category. */
const CATEGORY_BY_PAGEURL: Record<string, MastersMainCategory> = {
  hair: 'HAIR',
  face: 'FACE',
  body: 'BODY',
  nails: 'NAILS',
};

/**
 * getServiceCategoryMap — service page id → main category, for both catalog levels.
 *
 * Keyed by BOTH the 4 main category pages and their subcategory children,
 * because `master_services` references service PRODUCTS whose usable numeric id
 * is `value.parentId` — the products' subcategory page.
 *
 * Request-deduped: the specialists page and the reviews page need the same map
 * within one render, and each build costs one read per main category.
 * @returns {Promise<Map<number, MastersMainCategory>>} Page id → main category
 */
export const getServiceCategoryMap = cache(
  async (): Promise<Map<number, MastersMainCategory>> => {
    const categoryByServiceId = new Map<number, MastersMainCategory>();

    const { pages } = await getChildPagesByParentUrl('services');
    const mainCats = (pages ?? []).filter(
      (page: IPagesEntity) => CATEGORY_BY_PAGEURL[page.pageUrl],
    );
    mainCats.forEach((page: IPagesEntity) => {
      const category = CATEGORY_BY_PAGEURL[page.pageUrl];
      if (category) categoryByServiceId.set(page.id, category);
    });

    const subcatGroups = await Promise.all(
      mainCats.map(async (page: IPagesEntity) => ({
        category: CATEGORY_BY_PAGEURL[page.pageUrl],
        children: (await getChildPagesByParentUrl(page.pageUrl)).pages,
      })),
    );
    subcatGroups.forEach(({ category, children }) => {
      if (!category) return;
      children?.forEach((child: IPagesEntity) =>
        categoryByServiceId.set(child.id, category),
      );
    });

    return categoryByServiceId;
  },
);
