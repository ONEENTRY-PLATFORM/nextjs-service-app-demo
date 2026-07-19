'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { IMenusEntity } from 'oneentry/dist/menus/menusInterfaces';
import type { JSX } from 'react';
import { useContext, useEffect, useRef } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import { normalizeMenuPages } from '@/components/normalizeMenuPages';
import { useDialogA11y } from '@/components/shared/useDialogA11y';
import { flatMenuToNested } from '@/components/utils';

import ModalBackdrop from '../modal/components/ModalBackdrop';
import MobileMenuAnimations from './animations/MobileMenuAnimations';
import CloseModal from './components/CloseModal';
import MobileMenu from './components/MobileMenu';

/**
 * Mobile menu offscreen modal
 * @param   {object}       props      - Mobile menu props
 * @param   {IMenusEntity} props.menu - Represents a menu - array of objects.
 * @returns {JSX.Element}             Mobile menu list item
 */
const OffscreenModal = ({ menu }: { menu: IMenusEntity }): JSX.Element => {
  /** Get current pathname for route change detection */
  const pathname = usePathname();
  /** Get modal state and control functions from context */
  const { open, setOpen, component, setTransition } =
    useContext(OpenDrawerContext);

  /** Convert flat menu structure to nested structure for rendering */
  const mainMenu = flatMenuToNested(normalizeMenuPages(menu.pages), null);

  /** Handle window resize to close menu on larger screens */
  useEffect(() => {
    /** Function to close menu when window is resized to larger than 1023px */
    const handleResize = () => {
      if (window.innerWidth > 1023) {
        setOpen(false);
      }
    };
    /** Add event listener for window resize */
    window.addEventListener('resize', handleResize);
    /* Clean up event listener on component unmount */
    return () => window.removeEventListener('resize', handleResize);
  }, [setOpen]);

  /**
   * Close the menu when the route actually changes.
   *
   * The path at mount is remembered so this does not fire on mount: the drawer
   * is mounted lazily *because* it was just opened, and closing it immediately
   * would make the hamburger appear dead.
   */
  const mountedPath = useRef(pathname);
  useEffect(() => {
    if (mountedPath.current === pathname) {
      return;
    }
    setOpen(false);
  }, [pathname, setOpen]);

  /** Dialog a11y: focus trap/restore, scroll lock and Escape → close animation. */
  const dialogRef = useDialogA11y({
    isOpen: open && component === 'MobileMenu',
    onClose: () => setTransition('close'),
  });

  /** Don't render if menu is not open or component is not MobileMenu */
  if (!open || component !== 'MobileMenu') {
    return <></>;
  }

  /** Render mobile menu offscreen modal with backdrop */
  return (
    <MobileMenuAnimations
      id="modalBody"
      className="fixed z-450 flex size-full flex-col overflow-auto p-6 pt-12 shadow-xl md:overflow-hidden md:rounded-3xl lg:h-auto lg:w-90 lg:p-10"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="fixed inset-0 z-50 flex size-full max-w-90 flex-col bg-white pb-6"
      >
        <div className="p-6">
          <CloseModal />
          <div className="mb-4 w-full">
            <Image
              src={'/images/thalia-logo.svg'}
              width={110}
              height={70}
              alt={'Thalia'}
              loading="lazy"
              className="h-auto max-w-full shrink-0 max-sm:mb-5"
            />
          </div>
          <MobileMenu menu={mainMenu} />
        </div>
      </div>
      <ModalBackdrop />
    </MobileMenuAnimations>
  );
};

export default OffscreenModal;
