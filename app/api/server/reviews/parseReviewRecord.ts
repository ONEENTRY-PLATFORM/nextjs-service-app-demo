import type { IFormByMarkerDataEntity } from 'oneentry/types';

import type { CmsReview } from '@/app/api/server/reviews/types';

/**
 * fieldValue — raw value of one submitted field, by marker.
 * @param   {IFormByMarkerDataEntity} record - Form data record
 * @param   {string}                  marker - Field marker to read
 * @returns {unknown}                        The field's value, or `undefined` when the field is absent
 */
const fieldValue = (
  record: IFormByMarkerDataEntity,
  marker: string,
): unknown => {
  const fields = Array.isArray(record.formData) ? record.formData : [];
  return fields.find((field) => field.marker === marker)?.value;
};

/**
 * plainText — text of a `text` field, whatever shape the CMS used for it.
 *
 * A `text` value arrives as `[{ plainValue, htmlValue }]`, but a record written
 * through another path can carry the bare object or a plain string, so all three
 * are unwrapped here rather than at every call site.
 * @param   {unknown} value - Raw field value
 * @returns {string}        Plain text, empty when nothing readable is there
 */
const plainText = (value: unknown): string => {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate === 'string') return candidate;
  if (candidate && typeof candidate === 'object') {
    const { plainValue, htmlValue } = candidate as {
      plainValue?: string;
      htmlValue?: string;
    };
    return plainValue ?? (htmlValue ?? '').replace(/<[^>]*>/g, '');
  }
  return '';
};

/**
 * parseReviewRecord — map a `master_review` form record onto the review shape the UI renders.
 *
 * Records with no body are dropped by the caller: a rating with no text has
 * nothing to show in a review card.
 * @param   {IFormByMarkerDataEntity} record - One record from `getFormsDataByMarker`
 * @returns {CmsReview | null}               Normalized review, or `null` when the record carries no text
 */
export const parseReviewRecord = (
  record: IFormByMarkerDataEntity,
): CmsReview | null => {
  const text = plainText(fieldValue(record, 'review_text')).trim();
  if (!text) return null;

  /** `review_date` holds the display date of imported reviews; live ones only have `time`. */
  const isoDate = String(fieldValue(record, 'review_date') ?? '').trim();
  const recordTime = record.time ? String(record.time) : '';

  return {
    id: String(record.id),
    author: String(fieldValue(record, 'review_author') ?? '').trim(),
    masterId: Number(fieldValue(record, 'review_master') ?? 0),
    rating: Number(fieldValue(record, 'rating') ?? 0),
    date: isoDate || recordTime.slice(0, 10),
    text,
  };
};
