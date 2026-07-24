import type { IAttributeValues } from 'oneentry/dist/base/utils';

import { formatUaePhone } from '@/components/utils/formatUaePhone';
import type { CmsSalon } from '@/components/utils/salonFromPage';

/** One "Reach out" row of the contacts page. */
export interface ContactRow {
  /** Icon key — a key of the card's `INFO_ICONS` map */
  icon: 'phone' | 'mail' | 'map-pin' | 'clock';
  /** Row caption */
  label: string;
  /** Row value (phone, e-mail, address, hours) */
  value: string;
  /** Link target (`#` for the rows that are not actionable) */
  href: string;
}

/**
 * The studio e-mail has no CMS source yet — salon pages carry only
 * `salon_address`/`salon_phone`. Kept as a placeholder so the row still renders;
 * drop it once a `salon_email` attribute (or a dictionary marker) exists.
 */
const FALLBACK_EMAIL = 'hello@beautystudio.com';

/**
 * Reads a dictionary string by marker, falling back to a literal.
 * @param   {IAttributeValues | undefined} dict     - System-content dictionary
 * @param   {string}                       marker   - Dictionary marker to read
 * @param   {string}                       fallback - Value used when the marker is absent
 * @returns {string}                                The dictionary text, or the fallback
 */
const dictText = (
  dict: IAttributeValues | undefined,
  marker: string,
  fallback: string,
): string => {
  const value = dict?.[marker]?.value;
  return typeof value === 'string' && value ? value : fallback;
};

/**
 * buildContactRows — assemble the "Reach out" rows of the contacts page from CMS
 * data instead of a hardcoded list.
 *
 * Phone and address come from the primary (head-office) salon page; the hours
 * come from the collapsed `opening_time` week, falling back to the dictionary
 * value. Rows with no value (a salon without a phone/address) are dropped so the
 * card degrades cleanly. The e-mail row stays on {@link FALLBACK_EMAIL} until the
 * CMS gains an e-mail source.
 * @param   {object}                       args       - Grouped arguments
 * @param   {CmsSalon | undefined}         args.salon - Primary salon (phone/address source)
 * @param   {string | null}                args.hours - Collapsed week hours, or `null`
 * @param   {IAttributeValues | undefined} args.dict  - System-content dictionary
 * @returns {ContactRow[]}                            The rows ready to render
 */
export const buildContactRows = ({
  salon,
  hours,
  dict,
}: {
  salon: CmsSalon | undefined;
  hours: string | null;
  dict: IAttributeValues | undefined;
}): ContactRow[] => {
  const rows: ContactRow[] = [];

  if (salon?.phone) {
    rows.push({
      icon: 'phone',
      label: dictText(dict, 'salon_phone_label', 'General phone'),
      value: formatUaePhone(salon.phone),
      href: `tel:${salon.phone}`,
    });
  }

  rows.push({
    icon: 'mail',
    label: dictText(dict, 'contact_email_label', 'E-mail us'),
    value: FALLBACK_EMAIL,
    href: `mailto:${FALLBACK_EMAIL}`,
  });

  if (salon?.address) {
    rows.push({
      icon: 'map-pin',
      label: dictText(dict, 'salon_address_label', 'Head office'),
      value: salon.address,
      href: '#',
    });
  }

  const daily = dictText(dict, 'stat_daily_text', 'Daily');
  rows.push({
    icon: 'clock',
    label: dictText(dict, 'salon_hours_label', 'Working hours'),
    value: hours
      ? `${daily} ${hours}`
      : dictText(dict, 'salon_hours_value', 'Daily 10:00–22:00'),
    href: '#',
  });

  return rows;
};
