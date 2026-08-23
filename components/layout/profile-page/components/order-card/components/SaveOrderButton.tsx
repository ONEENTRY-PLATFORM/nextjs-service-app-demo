/* eslint-disable jsdoc/reject-function-type */
import type {
  IAttributeValues,
  IOrderByMarkerEntity,
  IOrderData,
} from 'oneentry/types';
import type { Dispatch, JSX, SetStateAction } from 'react';
import { toast } from 'react-toastify';

import { useUpdateOrderMutation } from '@/app/api/api/RTKApi';
import {
  ORDERS_STATUS_COMPLETED,
  ORDERS_STORAGE_MARKER,
} from '@/app/store/orderMarkers';

/**
 * SaveOrderButton Component
 *
 * This component renders a button that allows users to save an order. When clicked,
 * it updates the order status to 'completed' and saves the order data.
 *
 * Writes through the `updateOrder` mutation, which declares
 * `invalidatesTags: ['Orders']` — the history list re-reads itself, so no
 * refetch flag has to be passed in from the page.
 * @param   {object}               props              - The component props.
 * @param   {IOrderByMarkerEntity} props.orderData    - The order data to be saved. If not provided, the save operation will be skipped.
 * @param   {Function}             props.setEditState - Function to update the edit state of the order form
 * @param   {IAttributeValues}     props.dict         - Dictionary object
 * @returns {JSX.Element}                             JSX.Element - A button component for saving orders
 */
const SaveOrderButton = ({
  dict,
  orderData,
  setEditState,
}: {
  dict: IAttributeValues;
  orderData?: IOrderByMarkerEntity;
  setEditState: Dispatch<SetStateAction<IOrderByMarkerEntity | undefined>>;
}): JSX.Element => {
  const [updateOrder] = useUpdateOrderMutation();

  /**
   * Handles the order saving process
   *
   * This function prepares the order data by mapping products to the required format,
   * sets the order status to 'completed', and calls the API to update the order.
   * After successful update, it triggers a refetch and clears the edit state.
   */
  const handleSaveOrder = async (): Promise<void> => {
    if (!orderData) return;

    /** Prepare form data with mapped products and completed status */
    const formData = {
      ...orderData,
      products: orderData.products?.map((product) => ({
        productId: product.id,
        quantity: product.quantity,
      })),
      statusIdentifier: ORDERS_STATUS_COMPLETED,
    } as IOrderData;

    try {
      /** `.unwrap()` turns a failed mutation into a throw we can catch */
      await updateOrder({
        marker: ORDERS_STORAGE_MARKER,
        id: orderData.id,
        body: formData,
      }).unwrap();
    } catch (e) {
      /** On failure keep the edit form open and surface the error */
      const message =
        (e as { message?: string } | undefined)?.message ??
        ((dict.err_save_order?.value as string | undefined) ||
          'Could not save the order');
      toast.error(message);
      return;
    }

    /** The list refreshes itself — the mutation invalidates the `Orders` tag */
    setEditState(undefined);
  };

  /** Render the button and icons for repeating an order */
  return (
    <button
      onClick={handleSaveOrder}
      type="button"
      className="flex-1 rounded-lg bg-gradient-brand py-2 text-base font-bold text-white transition-all hover:opacity-90"
    >
      {(dict.save_button_text?.value as string | undefined) || 'Save'}
    </button>
  );
};

export default SaveOrderButton;
