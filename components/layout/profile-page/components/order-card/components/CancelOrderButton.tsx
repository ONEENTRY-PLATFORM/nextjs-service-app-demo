import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type {
  IOrderByMarkerEntity,
  IOrderData,
} from 'oneentry/dist/orders/ordersInterfaces';
import type { JSX } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';
import { toast } from 'react-toastify';

import { updateOrderByMarkerAndId } from '@/app/api';

/**
 * Cancel order button
 * @param   {object}                            props            - Component props
 * @param   {IAttributeValues}                  props.dict       - The dictionary object containing translations
 * @param   {IOrderByMarkerEntity}              props.orderData  - The order data to be cancelled
 * @param   {Dispatch<SetStateAction<boolean>>} props.setRefetch - Function to trigger a refetch of order data after cancellation
 * @returns {JSX.Element}                                        JSX.Element
 */
const CancelOrderButton = ({
  dict,
  orderData,
  setRefetch,
}: {
  dict: IAttributeValues;
  orderData?: IOrderByMarkerEntity;
  setRefetch: Dispatch<SetStateAction<boolean>>;
}): JSX.Element => {
  /** Destructure cancel text from dictionary */
  const { cancel_text } = dict;

  /** Memoized function to handle order cancellation */
  const cancelOrderHandle = useCallback(async () => {
    if (!orderData) return;

    /** Extract id and products from order data */
    const { id, products } = orderData;

    /** Construct form data for updating the order status */
    const formData = {
      ...orderData,
      /** Map through products to extract necessary fields */
      products: products?.map((product) => ({
        productId: product.id,
        quantity: product.quantity,
      })),
      statusIdentifier: 'canceled',
    } as IOrderData;

    /** Update the order using the API function */
    const { isError, error } = await updateOrderByMarkerAndId({
      marker: 'orders',
      id,
      data: formData,
    });

    /** Surface a failed cancellation instead of falsely reporting success */
    if (isError) {
      toast.error(error?.message || 'Could not cancel the order');
      return;
    }

    /** Trigger refetching of data and show a toast notification */
    setRefetch(true);
    toast('Order canceled!');
  }, [orderData, setRefetch]);

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
