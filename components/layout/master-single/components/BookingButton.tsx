'use client';

import { useTransitionRouter } from 'next-transition-router';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  addServiceToCart,
  selectActiveItemId,
  setTabsState,
} from '@/app/store/reducers/CartSlice';

/**
 * BookingButton component to handle booking actions.
 *
 * This component renders a button that allows users to book a service with a specific master.
 * When clicked, it adds the service to the cart and navigates to the booking page.
 * @param   {object}                   props         - Component properties
 * @param   {IAdminEntity}             props.master  - The selected master for the service
 * @param   {IPagesEntity | undefined} props.service - The service to be booked
 * @param   {IAttributeValues}         props.dict    - Dictionary object containing localized text values
 * @returns {JSX.Element}                            JSX.Element representing the BookingButton component
 */
const BookingButton = ({
  service,
  master,
  dict,
}: {
  master: IAdminEntity;
  service?: IPagesEntity | undefined;
  dict: IAttributeValues;
}): JSX.Element => {
  /** Get router instance for navigation with transitions */
  const router = useTransitionRouter();
  /** Get dispatch function for Redux actions */
  const dispatch = useAppDispatch();
  /** Extract booking text from dictionary */
  const { book_online_text } = dict;
  /** Active cart row index */
  const activeId = useAppSelector(selectActiveItemId);

  /** Handle booking action */
  const onApplyHandle = () => {
    /** Check if either service or master is available */
    if (service || master) {
      /** Add service and master to cart */
      dispatch(
        addServiceToCart({
          id: activeId,
          serviceId: service?.id ?? null,
          masterId: master?.id ?? null,
          salonId: null,
          productId: null,
        }),
      );
      /** Update tabs state to show services tab */
      dispatch(setTabsState({ key: 'services', value: true }));
      /** Update tabs state to show masters tab */
      dispatch(setTabsState({ key: 'masters', value: true }));
      router.push('/booking');
    }
  };

  /** Render booking button with click handler */
  return (
    <button
      onClick={onApplyHandle}
      className="item h-12.5 items-center justify-center self-start rounded-3xl border border-solid border-fuchsia-500 bg-transparent px-8 py-1 text-md font-bold tracking-wide text-fuchsia-500 uppercase transition-colors duration-300 hover:border-fuchsia-600 hover:text-fuchsia-600 focus-visible:text-fuchsia-600 focus-visible:outline-fuchsia-600 disabled:border-neutral-300 disabled:text-neutral-300"
    >
      {(book_online_text?.value as string | undefined) || 'BOOK ONLINE'}
    </button>
  );
};

export default BookingButton;
