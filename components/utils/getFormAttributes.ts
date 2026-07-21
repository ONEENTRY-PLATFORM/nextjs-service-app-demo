import type { IFormAttribute } from 'oneentry/dist/forms/formsInterfaces';

/**
 * Extract form attributes (fields) from a OneEntry form entity as an array.
 *
 * The Forms API returns `attributes` either as an array of fields or as a
 * plain object — in particular an empty `{}` when the form has no fields
 * configured in the admin panel. This helper normalizes both shapes so
 * consumers can safely call array methods (`sort`, `map`, `filter`).
 * @param   {object | undefined} form - Form entity from the OneEntry Forms API (or undefined while loading)
 * @returns {Array}                   Shallow copy of the attributes array, or an empty array
 * @example
 * ```typescript
 * const fields = getFormAttributes(data).sort((a, b) => a.position - b.position);
 * ```
 */
export const getFormAttributes = <T = IFormAttribute>(
  form: { attributes?: unknown } | undefined,
): T[] => {
  const attributes = form?.attributes;
  if (Array.isArray(attributes)) {
    return [...attributes] as T[];
  }
  /**
   * The Forms API also returns `attributes` as an OBJECT keyed by marker — an
   * empty `{}` for a field-less form, but a populated map once fields exist.
   * Take its values so a configured object-shaped form renders instead of
   * silently coming back blank (the empty `{}` still yields `[]`).
   */
  if (attributes && typeof attributes === 'object') {
    return Object.values(attributes) as T[];
  }
  return [];
};
