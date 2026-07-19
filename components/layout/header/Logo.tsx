import Link from 'next/link';
import type { JSX } from 'react';

import LogoIcon from '../../shared/LogoIcon';

/**
 * Logo component to render the site logo with a link to the homepage.
 *
 * This component displays the site logo as a clickable link that navigates to the homepage.
 * It uses the LogoIcon component and applies styling for proper display and focus states.
 * The logo is rendered as an SVG and uses the Next.js Link component for client-side navigation.
 * @returns {JSX.Element} JSX.Element representing the site logo linked to the homepage
 */
const Logo = (): JSX.Element => {
  return (
    <Link
      href={'/'}
      prefetch={false}
      className="logo w-full fade-in focus:outline-none"
    >
      <LogoIcon
        className={'max-w-full'}
        fill={'#000000'}
        stroke={'#000000'}
        width={91}
        height={58}
      />
    </Link>
  );
};

export default Logo;
