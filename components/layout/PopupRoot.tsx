'use client';

import dynamic from 'next/dynamic';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IMenusEntity } from 'oneentry/dist/menus/menusInterfaces';
import type { JSX } from 'react';
import { useContext } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';

/**
 * Popup chunks are fetched only when a popup is actually opened, so neither the
 * forms modal nor the mobile drawer sits in the first-load JS of every page.
 */
const Modal = dynamic(() => import('@/components/layout/modal'));
const OffscreenModal = dynamic(() => import('@/components/layout/mobile-menu'));

/**
 * PopupRoot — the single mount point for every overlay in the root layout.
 *
 * Instead of rendering all popups on every page and letting each one gate
 * itself, this subscribes to {@link OpenDrawerContext} and mounts only the
 * popup that is currently open: the mobile navigation drawer for `MobileMenu`,
 * the forms modal for any form name. While nothing is open, no popup code is
 * loaded at all.
 * @param   {object}           props      - Component properties
 * @param   {IAttributeValues} props.dict - Dictionary passed to the forms modal
 * @param   {IMenusEntity}     props.menu - Main menu passed to the mobile drawer
 * @returns {JSX.Element}                 The active popup, or nothing
 */
const PopupRoot = ({
  dict,
  menu,
}: {
  dict: IAttributeValues;
  menu: IMenusEntity;
}): JSX.Element => {
  const { open, component } = useContext(OpenDrawerContext);

  /** Nothing open → nothing mounted and nothing downloaded. */
  if (!open || !component) {
    return <></>;
  }

  if (component === 'MobileMenu') {
    return <OffscreenModal menu={menu} />;
  }

  return <Modal dict={dict} />;
};

export default PopupRoot;
