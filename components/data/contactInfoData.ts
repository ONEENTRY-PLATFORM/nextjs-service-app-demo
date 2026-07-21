/** One "Reach out" row of the contacts page. */
export interface ContactInfoEntry {
  /** Icon key — a key of the card's `INFO_ICONS` map */
  icon: 'phone' | 'mail' | 'map-pin' | 'clock';
  /** Row caption */
  label: string;
  /** Row value (phone, e-mail, address, hours) */
  value: string;
  /** Accent color of the tinted icon tile */
  color: string;
  /** Link target (`#` for the rows that are not actionable) */
  href: string;
}

/**
 * "Reach out" cards of the contacts page — the mock's hardcoded studio
 * contacts (`ContactsPage.tsx` → ContactInfo) until they move to the CMS.
 */
export const contactInfoData: ContactInfoEntry[] = [
  {
    icon: 'phone',
    label: 'General phone',
    value: '+971 4 784 0098',
    color: '#ed21f1',
    href: 'tel:+97147840098',
  },
  {
    icon: 'mail',
    label: 'E-mail us',
    value: 'hello@beautystudio.com',
    color: '#109aa9',
    href: 'mailto:hello@beautystudio.com',
  },
  {
    icon: 'map-pin',
    label: 'Head office',
    value: 'Sheikh Mohammed bin Rashid Blvd, Downtown Dubai',
    color: '#9b4fb2',
    href: '#',
  },
  {
    icon: 'clock',
    label: 'Working hours',
    value: 'Daily 10:00–22:00',
    color: '#9b4fb2',
    href: '#',
  },
];
