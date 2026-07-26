'use client';

import { Menu, X } from 'lucide-react';
import type { JSX } from 'react';
import { useContext } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import { useDict } from '@/app/store/providers/useDict';
import { dictText } from '@/components/utils/dictText';

/**
 * Mobile menu trigger button component.
 *
 * Renders the lucide `Menu` icon (22px, DARK) that switches to `X` while the
 * inline mobile panel is open.
 * Visible on <lg only; toggles the panel through {@link OpenDrawerContext}.
 * @returns {JSX.Element} JSX.Element representing a mobile menu trigger button
 */
const MobileMenuTrigger = (): JSX.Element => {
  /** Get context functions to control the mobile panel state */
  const { open, setOpen, component, setComponent } =
    useContext(OpenDrawerContext);
  /** UI-text dictionary for the localized aria-label */
  const dict = useDict();
  const isOpen = open && component === 'MobileMenu';

  /** Toggle the inline mobile navigation panel */
  const handleClick = () => {
    if (isOpen) {
      setOpen(false);
    } else {
      setOpen(true);
      setComponent('MobileMenu');
    }
  };

  /* Render mobile menu trigger button with Menu/X icon */
  return (
    <button
      onClick={handleClick}
      aria-label={
        isOpen
          ? dictText(dict, 'close_menu_aria', 'Close menu')
          : dictText(dict, 'open_menu_aria', 'Open menu')
      }
      aria-expanded={isOpen}
      data-testid="mobile-nav-toggle"
      className="p-2 text-slate-400 lg:hidden"
    >
      {isOpen ? <X size={22} /> : <Menu size={22} />}
    </button>
  );
};

export default MobileMenuTrigger;
