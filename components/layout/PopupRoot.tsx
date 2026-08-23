'use client';

import dynamic from 'next/dynamic';
import type { IAttributeValues } from 'oneentry/types';
import type { JSX } from 'react';
import { useContext } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';

/**
 * Popup chunks are fetched only when a popup is actually opened, so the forms
 * modal does not sit in the first-load JS of every page.
 */
const Modal = dynamic(() => import('@/components/layout/modal'));

/**
 * PopupRoot — the single mount point for every overlay in the root layout.
 *
 * Instead of rendering all popups on every page and letting each one gate
 * itself, this subscribes to {@link OpenDrawerContext} and mounts only the
 * popup that is currently open (the forms modal for any form name). While
 * nothing is open, no popup code is loaded at all. The mobile navigation is
 * not an overlay anymore — it renders as an inline panel inside the header
 * (`MobileNavPanel`).
 * @param   {object}           props      - Component properties
 * @param   {IAttributeValues} props.dict - Dictionary passed to the forms modal
 * @returns {JSX.Element}                 The active popup, or nothing
 */
const PopupRoot = ({ dict }: { dict: IAttributeValues }): JSX.Element => {
  const { open, component } = useContext(OpenDrawerContext);

  /** Nothing open → nothing mounted and nothing downloaded. */
  if (!open || !component || component === 'MobileMenu') {
    return <></>;
  }

  return <Modal dict={dict} />;
};

export default PopupRoot;
