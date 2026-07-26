/**
 * Social networks the footer and the contacts card link to.
 * @property {string}                               title - Network name, used as the link's `aria-label`
 * @property {'instagram' | 'facebook' | 'twitter'} icon  - Icon key — an export of `components/icons` and a key of `SOCIAL_ICONS`
 * @property {string}                               link  - Profile URL — fallback for the CMS marker `social_{icon}_url`
 */
export interface SocialEntry {
  title: string;
  icon: 'instagram' | 'facebook' | 'twitter';
  link: string;
}

/**
 * The networks the studio links to. Each entry is bound to an icon component,
 * so the list itself stays in code; the URLs come from `system_content`
 * (`social_{icon}_url`) through `buildSocialLinks` and the values here are only
 * the fallback used when the dictionary is unavailable.
 */
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
