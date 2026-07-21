/** Social networks the footer and the contacts card link to. */
export interface SocialEntry {
  /** Network name, used as the link's `aria-label` */
  title: string;
  /** Icon key — an export of `components/icons` and a key of `SOCIAL_ICONS` */
  icon: 'instagram' | 'facebook' | 'twitter';
  /** Profile URL (placeholder until the real accounts exist) */
  link: string;
}

/** Social links of the studio — placeholders until they move to the CMS. */
export const socialData: SocialEntry[] = [
  {
    title: 'Instagram',
    icon: 'instagram',
    link: '#1',
  },
  {
    title: 'Facebook',
    icon: 'facebook',
    link: '#2',
  },
  {
    title: 'Twitter',
    icon: 'twitter',
    link: '#3',
  },
];
