import type { IAttributeValues } from 'oneentry/dist/base/utils';

/**
 * Duration of a service product in minutes, read from its CMS attributes.
 *
 * The catalog carries it as `duration` (the marker of the `service` set), with
 * `time` accepted as the older alias; either may arrive as a number or as a
 * numeric string, and an unpopulated attribute degrades to `null` rather than
 * to a made-up length.
 * @param   {IAttributeValues|undefined} attrs - `attributeValues` of the product
 * @returns {number|null}                      Minutes, or `null` when the CMS has none
 */
const productDurationMinutes = (
  attrs: IAttributeValues | undefined,
): number | null => {
  const raw = attrs?.duration?.value ?? attrs?.time?.value;
  if (typeof raw === 'number') return raw;
  if (
    typeof raw === 'string' &&
    raw.trim() !== '' &&
    !Number.isNaN(Number(raw))
  )
    return Number(raw);
  return null;
};

export default productDurationMinutes;
