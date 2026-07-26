import type { IAttributeValues } from 'oneentry/dist/base/utils';

import { dictText } from '@/components/utils/dictText';
import { formatUaePhone } from '@/components/utils/formatUaePhone';
import type { CmsSalon } from '@/components/utils/salonFromPage';

/**
 * One "Reach out" row of the contacts page.
 * @property {'phone' | 'mail' | 'map-pin' | 'clock'} icon  - Icon key — a key of the card's `INFO_ICONS` map
 * @property {string}                                 label - Row caption
 * @property {string}                                 value - Row value (phone, e-mail, address, hours)
 * @property {string}                                 href  - Link target (`#` for the rows that are not actionable)
 */
export interface ContactRow {
  icon: 'phone' | 'mail' | 'map-pin' | 'clock';
  label: string;
  value: string;
  href: string;
}

/**
 * buildContactRows — assemble the "Reach out" rows of the contacts page from CMS
 * data instead of a hardcoded list.
 *
 * Phone, e-mail and address come from the primary (head-office) salon page; the
 * hours come from the collapsed `opening_time` week, falling back to the
 * dictionary value. Rows with no value (a salon without a phone/e-mail/address)
 * are dropped so the card degrades cleanly.
 * @param   {object}                       args       - Grouped arguments
 * @param   {CmsSalon | undefined}         args.salon - Primary salon (phone/e-mail/address source)
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

  if (salon?.email) {
    rows.push({
      icon: 'mail',
      label: dictText(dict, 'contact_email_label', 'E-mail us'),
      value: salon.email,
      href: `mailto:${salon.email}`,
    });
  }

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
