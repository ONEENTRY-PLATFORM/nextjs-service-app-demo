import type { IError } from 'oneentry/dist/base/utils';
import type {
  IBaseOrdersEntity,
  IOrderData,
} from 'oneentry/dist/orders/ordersInterfaces';

import { getApi, isError } from '@/app/api';
import { withTimeout } from '@/app/api/utils/withTimeout';

/**
 * Getting all orders from the orders storage object created by the user
 * @param   {object}          props        - Parameter object.
 * @param   {string}          props.marker - The text identifier of the order storage object
 * @param   {number}          props.id     - ID of the order object
 * @param   {IOrderData}      props.data   - Object for updating an order
 * @returns {Promise<object>}              Promise resolving to an object containing the order data or error
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const updateOrderByMarkerAndId = async ({
  marker,
  id,
  data,
}: {
  marker: string;
  id: number;
  data: IOrderData;
}): Promise<{
  isError: boolean;
  error?: IError;
  order?: IBaseOrdersEntity;
}> => {
  try {
    const orderData = await withTimeout(
      getApi().Orders.updateOrderByMarkerAndId(marker, id, data),
      10_000,
      'updateOrderByMarkerAndId',
    );

    if (isError(orderData)) {
      return { isError: true, error: orderData };
    }
    return { isError: false, order: orderData };
  } catch (e) {
    return { isError: true, error: e as IError };
  }
};
