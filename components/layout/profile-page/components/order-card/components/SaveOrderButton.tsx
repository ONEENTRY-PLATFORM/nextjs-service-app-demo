/* eslint-disable jsdoc/reject-function-type */
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type {
  IOrderByMarkerEntity,
  IOrderData,
} from 'oneentry/dist/orders/ordersInterfaces';
import type { Dispatch, JSX, SetStateAction } from 'react';

import { updateOrderByMarkerAndId } from '@/app/api';

/**
 * SaveOrderButton Component
 *
 * This component renders a button that allows users to save an order. When clicked,
 * it updates the order status to 'completed' and saves the order data.
 * @param   {object}               props              - The component props.
 * @param   {IOrderByMarkerEntity} props.orderData    - The order data to be saved. If not provided, the save operation will be skipped.
 * @param   {Function}             props.setRefetch   - Function to trigger a refetch of order data after saving
 * @param   {Function}             props.setEditState - Function to update the edit state of the order form
 * @param   {IAttributeValues}     props.dict         - Dictionary object
 * @returns {JSX.Element}                             JSX.Element - A button component for saving orders
 */
const SaveOrderButton = ({
  orderData,
  setRefetch,
  setEditState,
}: {
  dict: IAttributeValues;
  orderData?: IOrderByMarkerEntity;
  setRefetch: Dispatch<SetStateAction<boolean>>;
  setEditState: Dispatch<SetStateAction<IOrderByMarkerEntity | undefined>>;
}): JSX.Element => {
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
      statusIdentifier: 'completed',
    } as IOrderData;

    /** Update order with the prepared data */
    await updateOrderByMarkerAndId({
      marker: 'orders',
      id: orderData.id,
      data: formData,
    });

    /** Trigger refetch and clear edit state after successful update */
    setRefetch(true);
    setEditState(undefined);
  };

  /** Render the button and icons for repeating an order */
  return (
    <button
      onClick={handleSaveOrder}
      type="button"
      className="flex-1 rounded-lg bg-gradient-brand py-2 text-base font-bold text-white transition-all hover:opacity-90"
    >
      {'Save'}
    </button>
  );
};

export default SaveOrderButton;
