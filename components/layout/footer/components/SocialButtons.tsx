import type { JSX } from 'react';

import { socialData } from '@/components/data';
import * as icons from '@/components/icons';

/**
 * SocialButtons component renders social media icons with links
 * @returns {Promise<JSX.Element[]>} Array of JSX elements representing social media buttons
 */
const SocialButtons = async (): Promise<JSX.Element[]> => {
  /** Map through social data to create social media links */
  return socialData.map((item, i) => {
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
