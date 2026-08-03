import type { IFormAttribute } from 'oneentry/dist/forms/formsInterfaces';

/**
 * Extract form attributes (fields) from a OneEntry form entity as an array.
 *
 * Since SDK 1.0.158 the field-less form (the API sends `{}`) is normalized to
 * `[]` by the SDK itself, so this helper is left with the shapes the SDK does
 * not cover: a form that has not loaded yet (`undefined`) and the keyed-object
 * form the API may still deliver. It also returns a fresh array, which callers
 * need because the RTK cache entity is frozen and they sort in place.
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
   * A populated form may still arrive as an OBJECT keyed by marker — the SDK
   * only rewrites the empty `{}` into `[]`. Take its values so an
   * object-shaped form renders instead of silently coming back blank.
   */
  if (attributes && typeof attributes === 'object') {
    return Object.values(attributes) as T[];
  }
  return [];
};
