import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';

/** A salon page read into plain fields — no formatting, no conversions. */
export interface CmsSalon {
  /** Page id, as the CMS stores it */
  id: number;
  /** `pageUrl`, the `/salons/{handle}` segment */
  url: string;
  /** Display name (`localizeInfos.title`, falling back to `pageUrl`) */
  name: string;
  /** Street address (`salon_address`), `''` when the CMS has none */
  address: string;
  /** Phone as stored (`salon_phone`), `''` when unset */
  phone: string;
}

/**
 * salonFromPage — read a CMS salon page once.
 *
 * Deliberately a READER, not a transformer: it hands back what the CMS holds
 * and leaves every conversion to the consumer that actually needs it. Phone
 * formatting lives at the render site, the raw `salon_time` schedule is read
 * straight off the page by the one screen that expands it, and the id stays the
 * number the CMS uses — the view types that want a string say so themselves,
 * where it is visible.
 *
 * The one thing it does decide is the type guard. Seven call sites used to read
 * `salon_address` / `salon_phone` inline with three different idioms, two of
 * which were unsound: `value as string ?? ''` only substitutes on
 * `null`/`undefined`, so any non-string the CMS returns — a number, or the empty
 * ARRAY an unset attribute comes back as — travelled on as a fake string and
 * reached `encodeURIComponent` and the `tel:` href. Here the value is accepted
 * only when it really is one.
 * @param   {IPagesEntity} page - Salon page from the CMS
 * @returns {CmsSalon}          The salon's fields, unconverted
 */
export const salonFromPage = (page: IPagesEntity): CmsSalon => {
  const attrs = page.attributeValues ?? {};

  const rawAddress = attrs.salon_address?.value;
  const rawPhone = attrs.salon_phone?.value;

  return {
    id: page.id,
    url: page.pageUrl,
    name: page.localizeInfos?.title || page.pageUrl,
    address: typeof rawAddress === 'string' ? rawAddress : '',
    phone: typeof rawPhone === 'string' ? rawPhone : '',
  };
};
