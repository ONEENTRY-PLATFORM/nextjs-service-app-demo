import { useTransitionRouter } from 'next-transition-router';
import type { IAttributeValues, IOrderByMarkerEntity } from 'oneentry/types';
import type { JSX } from 'react';

import { useAppDispatch } from '@/app/store/hooks';
import { ORDER_FIELD_SALON } from '@/app/store/orderMarkers';
import { addServiceToCart } from '@/app/store/reducers/CartSlice';

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
    /**
     * Extract salon id from the archived order's form data.
     *
     * Marker is `salon` (what the CMS `order` form declares — `order_salon` was
     * a guess that exists nowhere), and the stored value is a plain array of
     * page ids: `[40]`. Reading it as `[{ id }]` yielded `undefined`, so the
     * repeated order silently lost its salon even once the marker was right.
     */
    const salonEntity = orderData?.formData?.find(
      (field: { marker: string }) => field?.marker === ORDER_FIELD_SALON,
    );
    const salonId = (salonEntity?.value as number[] | undefined)?.[0];

    /** Extract product id from the archived order's products list */
    const productId = orderData?.products[0]?.id;

    /** Dispatch IDs-only payload to cart; read sites hydrate the entities */
    dispatch(
      addServiceToCart({
        salonId: salonId ?? null,
        productId: productId ?? null,
        masterId: null,
      }),
    );
    /** Navigate to booking page */
    router.push('/booking');
  };

  /** Render the "book again" button for repeating an order */
  return (
    <button
      type="button"
      data-testid="order-repeat"
      className="w-full rounded-lg border-2 border-fuchsia-500 px-3.5 py-2 text-base font-bold text-fuchsia-500 transition-all hover:opacity-90"
      onClick={repeatOrderHandle}
    >
      {(book_again_text?.value as string | undefined) || 'Book Again'}
    </button>
  );
};

export default RepeatOrder;
