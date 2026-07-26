import type { IAttributeValues } from 'oneentry/dist/base/utils';

import type { SocialEntry } from '@/components/data/socialData';
import { socialData } from '@/components/data/socialData';
import { dictText } from '@/components/utils/dictText';

/**
 * buildSocialLinks — take the studio's social URLs from the CMS.
 *
 * Which networks are shown stays in code ({@link socialData}) because each one
 * is bound to an icon component; only the profile URL is content, and it lives
 * in `system_content` as `social_{icon}_url`. A marker that is missing or empty
 * falls back to the local placeholder, so the buttons keep rendering when the
 * dictionary is unavailable.
 * @param   {IAttributeValues | undefined} dict - System-content dictionary
 * @returns {SocialEntry[]}                     The networks with their CMS URLs
 */
export const buildSocialLinks = (
  dict: IAttributeValues | undefined,
): SocialEntry[] =>
  socialData.map((entry) => ({
    ...entry,
    link: dictText(dict, `social_${entry.icon}_url`, entry.link),
  }));
