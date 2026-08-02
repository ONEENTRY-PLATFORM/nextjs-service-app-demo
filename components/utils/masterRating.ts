import type { IAttributeValues } from 'oneentry/dist/base/utils';

/**
 * masterRating — the master's `master_rating` integer, distinguishing "not
 * rated" from a real rating.
 *
 * Per SDK 1.0.157 an unfilled integer attribute comes back as `null` (never
 * `0`), so the raw value is accepted only when it really is a number; anything
 * else means the admin has not rated the master yet and the caller decides how
 * to degrade (the list mappers keep their neutral `?? 5` default, the profile
 * views hide the stars). Centralized so the null-fallback cannot drift between
 * call sites again — it used to be `|| 0` on profiles vs `|| 5` in lists.
 * @param   {IAttributeValues | undefined} attrs - The master admin's `attributeValues`
 * @returns {number | null}                      Rating 0–5, or `null` while unrated
 */
export const masterRating = (
  attrs: IAttributeValues | undefined,
): number | null => {
  const raw = attrs?.master_rating?.value;
  return typeof raw === 'number' ? raw : null;
};
