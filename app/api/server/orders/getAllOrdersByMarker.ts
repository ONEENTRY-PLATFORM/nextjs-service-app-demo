import type { IError, IOrderByMarkerEntity } from 'oneentry/types';

import { getApi, isError } from '@/app/api/api/api';
import { fetchCmsData } from '@/app/api/utils/fetchCmsData';

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
    /**
     * Goes through `fetchCmsData` like every other wrapper. It used to call
     * `withTimeout` directly, which meant no retry on a latency spike and no
     * transient/stable classification — a 5xx came back as a plain envelope
     * instead of throwing, so a caching caller would have stored the outage.
     */
    const data = await fetchCmsData(
      () =>
        getApi().Orders.getAllOrdersByMarker(marker, undefined, offset, limit),
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
