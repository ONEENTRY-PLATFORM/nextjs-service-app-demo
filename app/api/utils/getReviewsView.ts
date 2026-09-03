import 'server-only';

import type { IAdminEntity, IPagesEntity } from 'oneentry/types';
import { cache } from 'react';

import { getChildPagesByParentUrl } from '@/app/api/server/pages/getChildPagesByParentUrl';
import { getReviews } from '@/app/api/server/reviews/getReviews';
import { getMastersList } from '@/app/api/utils/getMastersList';
import { getServiceCategoryMap } from '@/app/api/utils/getServiceCategoryMap';
import type {
  MastersMainCategory,
  SalonOption,
} from '@/components/layout/masters-page/taxonomy';
import type { ReviewView } from '@/components/layout/reviews-page/types';
import { entityLinks, entityPageIds } from '@/components/utils/entityLinks';
import { formatReviewDate } from '@/components/utils/formatReviewDate';
import { salonFromPage } from '@/components/utils/salonFromPage';

/**
 * getReviewsView — reviews with their specialist, salon and category resolved.
 *
 * The reviews carousel, the reviews page and a specialist profile all need the
 * same joined shape, and all three render within one request on some routes, so
 * the join is deduped here rather than repeated per page.
 *
 * Degrades quietly at every step: reviews of an unknown specialist keep the
 * empty name and drop out of the specialist filters, and a CMS failure yields
 * empty lists instead of failing the route.
 * @returns {Promise<{reviews: ReviewView[], salons: SalonOption[]}>} Reviews (newest first) and the salon filter options
 */
export const getReviewsView = cache(
  async (): Promise<{ reviews: ReviewView[]; salons: SalonOption[] }> => {
    const [{ reviews = [] }, { admins }, salonsResult, categoryByServiceId] =
      await Promise.all([
        getReviews(),
        getMastersList(),
        getChildPagesByParentUrl('salons'),
        getServiceCategoryMap(),
      ]);

    const salons: SalonOption[] =
      salonsResult.pages?.map((salonPage: IPagesEntity) => {
        const salon = salonFromPage(salonPage);
        return { id: salon.id, name: salon.name, address: salon.address };
      }) ?? [];

    /** Admin id → the bits of a specialist a review card and its filters need. */
    const masterById = new Map<
      number,
      {
        name: string;
        salonId: number | null;
        category: MastersMainCategory | null;
      }
    >();
    (admins ?? []).forEach((admin: IAdminEntity) => {
      const attrs = admin.attributeValues ?? {};
      const name = (attrs.master_name?.value as string | undefined) ?? '';
      if (!name) return;

      /**
       * `master_services` links service products, so the numeric page id to map
       * is `value.parentId` — the products' subcategory page.
       */
      const category =
        entityLinks(attrs.master_services?.value)
          .map((link) => link.parentId)
          .filter((id): id is number => typeof id === 'number')
          .map((id) => categoryByServiceId.get(id))
          .find((cat): cat is MastersMainCategory => Boolean(cat)) ?? null;

      masterById.set(admin.id, {
        name,
        salonId: entityPageIds(attrs.master_salon?.value)[0] ?? null,
        category,
      });
    });

    return {
      reviews: reviews.map((review) => {
        const master = masterById.get(review.masterId);
        return {
          id: review.id,
          author: review.author,
          master: master?.name ?? '',
          masterId: review.masterId,
          rating: review.rating,
          date: formatReviewDate(review.date),
          text: review.text,
          salonId: master?.salonId ?? null,
          category: master?.category ?? null,
        };
      }),
      salons,
    };
  },
);
