import { useTransitionRouter } from 'next-transition-router';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';
import type { JSX } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  addServiceToCart,
  selectActiveItemId,
  setTabsState,
} from '@/app/store/reducers/CartSlice';
import ReviewsIcon from '@/components/icons/reviews';
import StarOpenIconLg from '@/components/icons/star-o-lg';

/**
 * Main functional component to handle repeating an order
 * @param   {object}               props           - RepeatOrderProps
 * @param   {IAttributeValues}     props.dict      - Dictionary object
 * @param   {IOrderByMarkerEntity} props.orderData - Order data
 * @returns {JSX.Element}                          RepeatOrder component
 */
const RepeatOrder = ({
  dict,
  orderData,
}: {
  dict: IAttributeValues;
  orderData: IOrderByMarkerEntity;
}): JSX.Element => {
  /** Initialize dispatch function for Redux actions */
  const dispatch = useAppDispatch();
  /** Initialize router for navigation */
  const router = useTransitionRouter();
  /** Active cart row index */
  const activeId = useAppSelector(selectActiveItemId);
  /** Destructure book again text from dictionary */
  const { book_again_text } = dict;

  /**
   * Function to handle repeating an order.
   *
   * Pulls IDs out of the archived order entity and dispatches them to the
   * cart. Entities are hydrated from the RTK Query cache at the read sites,
   * so we don't need to re-fetch anything here.
   */
  const repeatOrderHandle = () => {
    /** Extract salon id from the archived order's form data */
    const salonEntity = orderData?.formData?.find(
      (field: { marker: string }) => field?.marker === 'order_salon',
    );
    const salonId = (
      salonEntity?.value as Array<{ id: number }> | undefined
    )?.[0]?.id;

    /** Extract product id from the archived order's products list */
    const productId = orderData?.products[0]?.id;

    /** Dispatch IDs-only payload to cart; useCartItem will hydrate at read sites */
    dispatch(
      addServiceToCart({
        id: activeId,
        salonId: salonId ?? null,
        productId: productId ?? null,
        serviceId: null,
        masterId: null,
      }),
    );
    dispatch(setTabsState({ key: 'salons', value: true }));
    dispatch(setTabsState({ key: 'services', value: true }));
    dispatch(setTabsState({ key: 'products', value: true }));
    dispatch(setTabsState({ key: 'masters', value: true }));
    /** Navigate to booking page */
    router.push('/booking');
  };

  /** Render the button and icons for repeating an order */
  return (
    <div className="my-auto flex w-full flex-col text-base font-bold tracking-wide text-fuchsia-500">
      <button
        className="mb-2 h-10 min-w-20 items-center justify-center rounded-3xl border border-solid border-fuchsia-500 bg-transparent p-1 text-base leading-6 font-bold tracking-wide text-fuchsia-500 transition-colors duration-300 hover:border-fuchsia-600 hover:text-fuchsia-600 focus-visible:text-fuchsia-600 focus-visible:outline-fuchsia-600 disabled:border-neutral-300 disabled:text-neutral-300"
        onClick={repeatOrderHandle}
      >
        {(book_again_text?.value as string | undefined) || 'Book again'}
      </button>
      <div className="flex gap-2 self-center">
        <StarOpenIconLg size={5} />
        <ReviewsIcon size={5} />
      </div>
    </div>
  );
};

export default RepeatOrder;
