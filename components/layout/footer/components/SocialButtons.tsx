import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import { ServerProvider } from '@/app/store/providers/ServerProvider';
import * as icons from '@/components/icons';
import { buildSocialLinks } from '@/components/utils/buildSocialLinks';

/**
 * SocialButtons component renders social media icons with links from the CMS
 * @returns {Promise<JSX.Element[]>} Array of JSX elements representing social media buttons
 */
const SocialButtons = async (): Promise<JSX.Element[]> => {
  const [dict] = ServerProvider<IAttributeValues>('dict');

  /** Map through social data to create social media links */
  return buildSocialLinks(dict).map((item, i) => {
    /** Get icon component based on icon name from data */
    const Icon = icons[item.icon as keyof typeof icons];
    /** Render social media link with icon */
    return (
      <a
        key={i}
        href={item.link}
        aria-label={item.title}
        className="transition-transform hover:scale-110 focus:outline-none"
      >
        <Icon size={22} />
      </a>
    );
  });
};

export default SocialButtons;
