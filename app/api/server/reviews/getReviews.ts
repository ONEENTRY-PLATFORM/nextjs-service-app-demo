import type { IError, IFormsByMarkerDataEntity } from 'oneentry/types';

import { getApi } from '@/app/api/api/api';
import { getFormByMarker } from '@/app/api/server/forms/getFormByMarker';
import { parseReviewRecord } from '@/app/api/server/reviews/parseReviewRecord';
import type { CmsReview } from '@/app/api/server/reviews/types';
import { createCachedCmsReader } from '@/app/api/utils/createCachedCmsReader';
import { expectCmsEntity } from '@/app/api/utils/expectCmsEntity';

/** Form the reviews live in — see `.claude/ONEENTRY-CONTENT-PLAN.md` §1. */
const REVIEWS_FORM_MARKER = 'master_review';

/** Upper bound of one read; the studio has a few dozen reviews, not thousands. */
const REVIEWS_LIMIT = 200;

/** Cached reader: TTL, request-level dedupe and transient-failure handling. */
const readReviewRecords = createCachedCmsReader<
  [number],
  IFormsByMarkerDataEntity
>({
  cacheKey: 'oneentry-review-records',
  label: 'getReviews',
  revalidate: 60,
  tags: ['oneentry', 'oneentry-reviews'],
  call: (formModuleConfigId) =>
    getApi().FormData.getFormsDataByMarker(
      REVIEWS_FORM_MARKER,
      formModuleConfigId,
      /** Only moderated-in reviews reach the site; the form pre-moderates. */
      { status: ['approved'] },
      0,
      undefined,
      0,
      REVIEWS_LIMIT,
    ),
  validate: (data) => expectCmsEntity(data, 'getReviews', 'items'),
});

/**
 * Get customer reviews from the CMS, newest first.
 *
 * Reviews are records of the `master_review` form rather than pages, so reading
 * them takes the form first: `formModuleConfigId` is read from its response and
 * never hardcoded — it changes whenever the form is recreated in the admin panel.
 *
 * Degrades quietly: a missing form, an empty storage or a transient CMS failure
 * all yield an empty list, so the reviews sections render their own empty state
 * instead of failing the route.
 * @returns {Promise<object>} Promise resolving to `{ isError, error?, reviews? }`
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 * @example
 * ```typescript
 * const { reviews = [] } = await getReviews();
 * const forMaster = reviews.filter((review) => review.masterId === admin.id);
 * ```
 */
export const getReviews = async (): Promise<{
  isError: boolean;
  error?: IError;
  reviews?: CmsReview[];
}> => {
  const {
    isError: formFailed,
    error: formError,
    form,
  } = await getFormByMarker(REVIEWS_FORM_MARKER);
  const formModuleConfigId = form?.moduleFormConfigs?.[0]?.id;

  if (formFailed || !formModuleConfigId) {
    return {
      isError: formFailed,
      ...(formError ? { error: formError } : {}),
      reviews: [],
    };
  }

  const {
    isError: failed,
    error,
    data,
  } = await readReviewRecords(formModuleConfigId);
  if (failed || !data) {
    return { isError: failed, ...(error ? { error } : {}), reviews: [] };
  }

  const items = Array.isArray(data.items) ? data.items : [];
  const reviews = items
    .map((record) => parseReviewRecord(record))
    .filter((review): review is CmsReview => review !== null)
    .sort((a, b) => b.date.localeCompare(a.date));

  return { isError: false, reviews };
};
