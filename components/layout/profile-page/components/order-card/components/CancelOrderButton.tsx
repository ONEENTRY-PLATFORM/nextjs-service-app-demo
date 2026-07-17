import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type {
  IOrderByMarkerEntity,
  IOrderData,
} from 'oneentry/dist/orders/ordersInterfaces';
import type { JSX } from 'react';
import { useCallback } from 'react';
import { toast } from 'react-toastify';

import { useUpdateOrderMutation } from '@/app/api/api/RTKApi';
import {
  ORDERS_STATUS_CANCELED,
  ORDERS_STORAGE_MARKER,
} from '@/app/store/orderMarkers';

/**
 * Cancel order button
 *
 * Writes through the `updateOrder` mutation, which declares
 * `invalidatesTags: ['Orders']` — the history list re-reads itself, so no
 * refetch flag has to be passed in from the page.
 * @param   {object}               props           - Component props
 * @param   {IAttributeValues}     props.dict      - The dictionary object containing translations
 * @param   {IOrderByMarkerEntity} props.orderData - The order data to be cancelled
 * @returns {JSX.Element}                          JSX.Element
 */
const CancelOrderButton = ({
  dict,
  orderData,
}: {
  dict: IAttributeValues;
  orderData?: IOrderByMarkerEntity;
}): JSX.Element => {
  const [updateOrder] = useUpdateOrderMutation();
  /** Destructure cancel text from dictionary */
  const { cancel_text } = dict;

  /** Memoized function to handle order cancellation */
  const cancelOrderHandle = useCallback(async () => {
    if (!orderData) return;

    /** Extract id and products from order data */
    const { id, products } = orderData;

    /**
     * Construct form data for updating the order status.
     *
     * The whole read object is spread and `statusIdentifier` set — verified
     * against the live API (2026-07-17, three orders cancelled through this
     * button): the server applies it and the extra read-only fields do no harm.
     * The `create-orders-list` recipe prescribes a minimal payload with
     * `statusMarker` instead; re-verify with a real request before switching,
     * since the recipe's key is NOT what this API accepted.
     */
    const formData = {
      ...orderData,
      /** Map through products to extract necessary fields */
      products: products?.map((product) => ({
        productId: product.id,
        quantity: product.quantity,
      })),
      statusIdentifier: ORDERS_STATUS_CANCELED,
    } as IOrderData;

    try {
      /** `.unwrap()` turns a failed mutation into a throw we can catch */
      await updateOrder({
        marker: ORDERS_STORAGE_MARKER,
        id,
        body: formData,
      }).unwrap();
    } catch (e) {
      /** Surface a failed cancellation instead of falsely reporting success */
      const message =
        (e as { message?: string } | undefined)?.message ??
        'Could not cancel the order';
      toast.error(message);
      return;
    }

    /** The list refreshes itself — the mutation invalidates the `Orders` tag */
    toast('Order canceled!');
  }, [orderData, updateOrder]);

  /** Render the cancel button */
  return (
    <button
      onClick={cancelOrderHandle}
      type="button"
      className="flex-1 rounded-lg border border-slate-150 py-2 text-base font-medium text-neutral-300 transition-all hover:bg-gray-50"
    >
      {(cancel_text?.value as string | undefined) || 'Cancel'}
    </button>
  );
};

export default CancelOrderButton;
