'use client';

import type { JSX } from 'react';
import { useContext } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import { prefetchPopup } from '@/components/layout/prefetchPopup';

/**
 * Mobile menu trigger button component.
 *
 * This component renders a hamburger-style menu button that is visible only on
 * mobile devices (lg breakpoint and below). When clicked, it opens the mobile
 * menu by updating the OpenDrawerContext state.
 *
 * The button consists of three horizontal lines (hamburger icon) and uses the
 * OpenDrawerContext to manage the mobile menu state. It sets the drawer to open
 * and specifies that the 'MobileMenu' component should be displayed.
 * @returns {JSX.Element} JSX.Element representing a mobile menu trigger button
 */
const MobileMenuTrigger = (): JSX.Element => {
  /** Get context functions to control drawer state and component */
  const { setOpen, setComponent } = useContext(OpenDrawerContext);

  /** Handle click event to open mobile menu drawer */
  const handleClick = () => {
    setOpen(true);
    setComponent('MobileMenu');
  };

  /** Render mobile menu trigger button with hamburger icon */
  return (
    <button
      onClick={handleClick}
      onPointerEnter={() => prefetchPopup('MobileMenu')}
      onFocus={() => prefetchPopup('MobileMenu')}
      aria-label="Open menu"
      className="flex size-10 flex-col items-center justify-center gap-1 rounded-md transition-colors lg:hidden"
    >
      {[...Array(3)].map((_, index) => (
        <span key={index} className="block h-0.5 w-8 bg-gray-600"></span>
      ))}
    </button>
  );
};

export default MobileMenuTrigger;
