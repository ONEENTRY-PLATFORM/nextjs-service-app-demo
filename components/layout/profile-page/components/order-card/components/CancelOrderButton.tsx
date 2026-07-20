'use client';

import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type {
  IOrderByMarkerEntity,
  IOrderData,
} from 'oneentry/dist/orders/ordersInterfaces';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

import { useUpdateOrderMutation } from '@/app/api/api/RTKApi';
import {
  ORDERS_STATUS_CANCELED,
  ORDERS_STORAGE_MARKER,
} from '@/app/store/orderMarkers';

import CancelConfirmModal from './CancelConfirmModal';
import CancelSuccessModal from './CancelSuccessModal';

/**
 * Cancel order button — the "Cancel booking" flow from the static-html mock:
 * the button opens a confirmation dialog ("Cancel this appointment?" with
 * "Keep appointment" / "Yes, cancel"), and a successful cancellation shows the
 * "Appointment cancelled" dialog instead of a toast.
 *
 * Writes through the `updateOrder` mutation, which declares
 * `invalidatesTags: ['Orders']` — the history list re-reads itself, so no
 * refetch flag has to be passed in from the page.
 * @param   {object}               props           - Component props
 * @param   {IAttributeValues}     props.dict      - The dictionary object containing translations
 * @param   {IOrderByMarkerEntity} props.orderData - The order data to be cancelled
 * @param   {IAdminEntity}         [props.master]  - Master associated with the order (confirm-dialog line)
 * @returns {JSX.Element}                          JSX.Element
 */
const CancelOrderButton = ({
  dict,
  orderData,
  master,
}: {
  dict: IAttributeValues;
  orderData?: IOrderByMarkerEntity;
  master?: IAdminEntity | undefined;
}): JSX.Element => {
  const [updateOrder] = useUpdateOrderMutation();
  /**
   * Label of the action. `cancel_booking_text` is the marker for THIS button;
   * the generic `cancel_text` ("Cancel") is the dictionary's dialog/dismiss
   * word and reading it here rendered a bare "Cancel" where the design asks for
   * "Cancel booking". Until the marker exists in the CMS the fallback carries it.
   */
  const { cancel_booking_text } = dict;
  /** Dialog stage: confirmation → success (null = no dialog) */
  const [stage, setStage] = useState<'confirm' | 'done' | null>(null);

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
      setStage(null);
      return;
    }

    /** The list refreshes itself — show the mock's success dialog. */
    setStage('done');
  }, [orderData, updateOrder]);

  /**
   * Confirm-dialog visit line, mock format: "Master · DD.MM.YYYY at HH:MM".
   * Both parts are optional — missing data just shortens the line.
   */
  const masterName =
    (master?.attributeValues?.master_name?.value as string | undefined) ?? '';
  const intervalField = orderData?.formData.find(
    (el: { marker: string }) => el.marker === 'interval',
  );
  const startTime = (intervalField?.value as string[][] | undefined)?.[0]?.[0];
  const startDate = startTime ? new Date(startTime) : null;
  const dateLine =
    startDate && !Number.isNaN(startDate.getTime())
      ? `${startDate.getUTCDate().toString().padStart(2, '0')}.${(
          startDate.getUTCMonth() + 1
        )
          .toString()
          .padStart(2, '0')}.${startDate.getUTCFullYear()} at ${startDate
          .getUTCHours()
          .toString()
          .padStart(2, '0')}:${startDate
          .getUTCMinutes()
          .toString()
          .padStart(2, '0')}`
      : '';
  const subtitle = [masterName, dateLine].filter(Boolean).join(' · ');

  /* Render the cancel button and its dialogs */
  return (
    <>
      <button
        onClick={() => setStage('confirm')}
        type="button"
        className="flex-1 rounded-lg border border-slate-150 py-2 text-base font-medium text-neutral-300 transition-all hover:bg-gray-50"
      >
        {(cancel_booking_text?.value as string | undefined) || 'Cancel booking'}
      </button>
      {stage === 'confirm' && (
        <CancelConfirmModal
          subtitle={subtitle}
          onKeep={() => setStage(null)}
          onConfirm={cancelOrderHandle}
        />
      )}
      {stage === 'done' && <CancelSuccessModal onDone={() => setStage(null)} />}
    </>
  );
};

export default CancelOrderButton;
