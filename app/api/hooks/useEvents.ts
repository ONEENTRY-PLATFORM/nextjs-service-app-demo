/* eslint-disable no-console */
import { getApi } from '@/app/api';

/**
 * Subscribe events with Events API.
 * @param   {number}        id - product id.
 * @returns {Promise<void>}    void
 */
export const onSubscribeEvents = async (id: number): Promise<void> => {
  try {
    await getApi().Events.subscribeByMarker('catalog_event', id);
    await getApi().Events.subscribeByMarker('status_out_of_stock', id);
    await getApi().Events.subscribeByMarker('product_price', id);
  } catch (e) {
    console.log(e);
  }
};

/**
 * Unsubscribe events with Events API.
 * @param   {number}        id - product id.
 * @returns {Promise<void>}    void
 */
export const onUnsubscribeEvents = async (id: number): Promise<void> => {
  try {
    await getApi().Events.unsubscribeByMarker('catalog_event', id);
    await getApi().Events.unsubscribeByMarker('status_out_of_stock', id);
    await getApi().Events.unsubscribeByMarker('product_price', id);
  } catch (e) {
    console.log(e);
  }
};
