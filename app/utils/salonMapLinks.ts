import type { CmsSalon } from '@/components/utils/salonFromPage';

/** Dialable phone and Google Maps URLs derived from a salon's address. */
export interface SalonMapLinks {
  /** `tel:` target — digits and a leading `+` only */
  tel: string;
  /** Embeddable map `src` for the card's iframe */
  mapSrc: string;
  /** "Get directions" link for the map button */
  mapsLink: string;
}

/**
 * salonMapLinks — build the dial and map targets of a salon.
 *
 * The CMS stores no coordinates, so both map URLs are built from the address
 * string. Identical code lived in the contacts page and the salon detail page;
 * a change to the map provider used to mean editing both.
 *
 * The `tel:` target is the stored phone stripped to digits. The old fallback to
 * a formatted phone was dead: `formatUaePhone('')` is `''`, so it could only
 * ever fire when the raw phone was empty — in which case the formatted one is
 * empty too.
 * @param   {CmsSalon}      salon - Salon read from the CMS
 * @returns {SalonMapLinks}       Dial and map targets
 */
export const salonMapLinks = (salon: CmsSalon): SalonMapLinks => {
  const query = encodeURIComponent(salon.address || salon.name);

  return {
    tel: salon.phone.replace(/[^+\d]/g, ''),
    mapSrc: `https://www.google.com/maps?q=${query}&z=15&hl=en&output=embed`,
    mapsLink: `https://www.google.com/maps/dir/?api=1&destination=${query}`,
  };
};
