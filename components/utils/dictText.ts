import type { IAttributeValues } from 'oneentry/dist/base/utils';

/**
 * dictText — read a `system_content` string by marker, falling back to a literal.
 *
 * The dictionary is optional (the block can be missing or a marker unfilled), so
 * every call site keeps an English fallback in code. The value is accepted only
 * when it really is a non-empty string: an unset attribute comes back from the
 * CMS as an empty array, which would otherwise travel on as a fake string.
 * @param   {IAttributeValues | undefined} dict     - System-content dictionary
 * @param   {string}                       marker   - Dictionary marker to read
 * @param   {string}                       fallback - Value used when the marker is absent
 * @returns {string}                                The dictionary text, or the fallback
 */
export const dictText = (
  dict: IAttributeValues | undefined,
  marker: string,
  fallback: string,
): string => {
  const value = dict?.[marker]?.value;
  return typeof value === 'string' && value ? value : fallback;
};
