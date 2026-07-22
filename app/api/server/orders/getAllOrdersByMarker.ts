import type { IError } from 'oneentry/dist/base/utils';
import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';

import { getApi, isError } from '@/app/api/api/api';
import { withTimeout } from '@/app/api/utils/withTimeout';

/**
 * Getting all orders from the orders storage object created by the user.
 *
 * ⚠️ Currently UNUSED — no module imports this wrapper: orders are user-scoped, so they are read client-side through `useGetAllOrdersByMarkerQuery`.
 * Kept per project convention; the split between the server wrappers and the
 * RTK Query endpoints was settled in favour of the latter here.
 * @param   {object}          props        - Parameter object.
 * @param   {string}          props.marker - The text identifier of the order storage object.
 * @param   {number}          props.offset - Offset parameter. Default 0.
 * @param   {number}          props.limit  - Limit parameter. Default 30.
 * @returns {Promise<object>}              All user orders.
 * @see {@link https://oneentry.cloud/instructions/npm OneEntry docs}
 */
export const getAllOrdersByMarker = async ({
  marker,
  offset,
  limit,
}: {
  marker: string;
  offset: number;
  limit: number;
}): Promise<{
  isError: boolean;
  error?: IError;
  orders?: IOrderByMarkerEntity[];
  total: number;
}> => {
  try {
    const data = await withTimeout(
      getApi().Orders.getAllOrdersByMarker(marker, undefined, offset, limit),
      10_000,
      'getAllOrdersByMarker',
    );

    if (isError(data)) {
      return { isError: true, error: data, total: 0 };
    }
    return { isError: false, orders: data.items, total: data.total };
  } catch (e) {
    return { isError: true, error: e as IError, total: 0 };
  }
};
