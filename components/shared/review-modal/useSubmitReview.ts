'use client';

import type { FormDataType } from 'oneentry/types';
import { useContext, useState } from 'react';

import { getApi, isError as isSdkError } from '@/app/api/api/api';
import { useGetFormByMarkerQuery } from '@/app/api/api/RTKApi';
import { AuthContext } from '@/app/store/providers/AuthContext';
import type { ReviewPhoto } from '@/components/shared/review-modal/types';
import { getUserDisplayName } from '@/components/utils/getUserDisplayName';
import { normalizeErrorMessage } from '@/components/utils/normalizeErrorMessage';

/** CMS form the reviews are stored in — see `.claude/ONEENTRY-CONTENT-PLAN.md` §1. */
const REVIEW_FORM_MARKER = 'master_review';

/**
 * One review as the dialog submits it.
 * @property {number}        masterId - Admin id of the specialist being reviewed
 * @property {number}        rating   - Star rating, 1–5
 * @property {string}        text     - Review body
 * @property {ReviewPhoto[]} photos   - Attached photos, uploaded with the record
 */
export interface SubmitReviewInput {
  masterId: number;
  rating: number;
  text: string;
  photos: ReviewPhoto[];
}

/**
 * State and actions the review dialog renders from.
 * @property {boolean}                                        isAuth  - A user session is active; the form only submits for signed-in visitors
 * @property {boolean}                                        loading - A submit is in flight
 * @property {string}                                         error   - Failure copy (`''` when none)
 * @property {(input: SubmitReviewInput) => Promise<boolean>} submit  - Send the review; resolves `true` once the CMS accepted it
 */
export interface SubmitReviewState {
  isAuth: boolean;
  loading: boolean;
  error: string;
  submit: (input: SubmitReviewInput) => Promise<boolean>;
}

/**
 * useSubmitReview — sends a visitor's review to the `master_review` form storage.
 *
 * The specialist is carried by the `review_master` field rather than
 * `moduleEntityIdentifier`: the API validates that identifier against the
 * entity of the form's module config (the `reviews` page), so an admin id there
 * is rejected outright.
 *
 * The form pre-moderates, so an accepted review lands in `moderation` and only
 * reaches the site once an admin approves it — the caller should thank the
 * visitor, not promise an immediate appearance.
 * @returns {SubmitReviewState} Auth flag, in-flight state, failure copy and the submit action
 */
export const useSubmitReview = (): SubmitReviewState => {
  const { isAuth, user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /** CMS form definition — `formModuleConfigId` must come from it, never hardcoded. */
  const { data } = useGetFormByMarkerQuery({ marker: REVIEW_FORM_MARKER });

  /**
   * Send one review.
   * @param   {SubmitReviewInput} input - Review to send
   * @returns {Promise<boolean>}        `true` when the CMS accepted the review
   */
  const submit = async ({
    masterId,
    rating,
    text,
    photos,
  }: SubmitReviewInput): Promise<boolean> => {
    setError('');

    const moduleConfig = data?.moduleFormConfigs?.[0];
    if (!moduleConfig?.id) {
      setError('Reviews are not available right now.');
      return false;
    }

    const formData: FormDataType[] = [
      { marker: 'rating', type: 'real', value: rating },
      { marker: 'review_text', type: 'text', value: [{ plainValue: text }] },
      {
        marker: 'review_author',
        type: 'string',
        value: getUserDisplayName(user),
      },
      { marker: 'review_master', type: 'string', value: String(masterId) },
    ] as FormDataType[];

    /**
     * Photos ride along as the `groupOfImages` field: `postFormsData` uploads
     * every `File` in its value before posting the record. The field is omitted
     * entirely when nothing is attached — an empty upload query would still hit
     * the file endpoint.
     */
    if (photos.length > 0) {
      formData.push({
        marker: 'review_photos',
        type: 'groupOfImages',
        value: photos.map((photo) => photo.file),
      } as unknown as FormDataType);
    }

    try {
      setLoading(true);

      /**
       * `postFormsData` returns `IPostFormResponse | IError` — an API failure is
       * a value, not a throw, so a rejected review must not thank the visitor.
       */
      const result = await getApi().FormData.postFormsData({
        formIdentifier: REVIEW_FORM_MARKER,
        formData,
        formModuleConfigId: moduleConfig.id,
        moduleEntityIdentifier: moduleConfig.entityIdentifiers?.[0]?.id ?? '',
        replayTo: null,
        /** Pre-moderation overrides this anyway; `'sent'` matches the module config lookup. */
        status: 'sent',
      });

      if (isSdkError(result)) {
        setError(
          data?.localizeInfos?.unsuccessMessage ||
            `Error ${result.statusCode}: ${normalizeErrorMessage(result.message)}`.trim(),
        );
        return false;
      }

      return true;
    } catch (e) {
      setError(normalizeErrorMessage((e as { message?: string }).message));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { isAuth, loading, error, submit };
};
