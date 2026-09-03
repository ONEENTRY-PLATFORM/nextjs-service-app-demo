/**
 * CmsReview — one customer review as the site renders it.
 *
 * Reviews live in OneEntry as records of the `master_review` form, not as pages:
 * the form is what lets a visitor leave one from the site. The fields below are
 * the form's own markers, already unwrapped from their CMS value shapes.
 * @property {string} id       - Record id, stringified (`#12` → `'12'`)
 * @property {string} author   - Display name of the customer (`review_author`)
 * @property {number} masterId - Admin id of the specialist the review is about (`review_master`)
 * @property {number} rating   - Star rating, 1–5 (`rating`)
 * @property {string} date     - ISO date (`review_date`), falling back to the record's own `time`
 * @property {string} text     - Review body (`review_text`)
 */
export type CmsReview = {
  id: string;
  author: string;
  masterId: number;
  rating: number;
  date: string;
  text: string;
};
