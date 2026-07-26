import type { JSX } from 'react';

import SocialButtons from './SocialButtons';

/**
 * FollowUs footer section: bold title and the social icons row.
 * @param   {object}               props       - Component properties
 * @param   {string}               props.title - Section title (from the CMS dictionary)
 * @returns {Promise<JSX.Element>}             Follow us section
 */
const FollowUs = async ({ title }: { title: string }): Promise<JSX.Element> => {
  return (
    <div>
      <p className="mb-5 text-base font-bold">{title}:</p>
      <div className="flex items-center gap-3">
        <SocialButtons />
      </div>
    </div>
  );
};

export default FollowUs;
