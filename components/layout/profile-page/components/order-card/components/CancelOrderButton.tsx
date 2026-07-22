'use client';

import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type {
  IOrderByMarkerEntity,
  IOrderData,
} from 'oneentry/dist/orders/ordersInterfaces';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';

import {
  useCreateRefundRequestMutation,
  useUpdateOrderMutation,
} from '@/app/api/api/RTKApi';
import {
  ORDERS_STATUS_CANCELED,
  ORDERS_STORAGE_MARKER,
} from '@/app/store/orderMarkers';
import { formatOrderCancelError } from '@/app/utils/formatOrderCancelError';
import { formatOrderTotal } from '@/app/utils/formatOrderTotal';
import { formatRefundError } from '@/app/utils/formatRefundError';
import { formatUtcDate } from '@/app/utils/formatUtcDate';
import { formatUtcTime } from '@/app/utils/formatUtcTime';
import { isPaidOrderError } from '@/app/utils/isPaidOrderError';
import { parseOrderInterval } from '@/app/utils/parseOrderInterval';

import CancelConfirmModal from './CancelConfirmModal';
import CancelErrorModal from './CancelErrorModal';
import CancelSuccessModal from './CancelSuccessModal';
import RefundRequestModal from './RefundRequestModal';
import RefundSuccessModal from './RefundSuccessModal';

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
  const [updateOrder, { isLoading }] = useUpdateOrderMutation();
  const [createRefundRequest, { isLoading: isRefunding }] =
    useCreateRefundRequestMutation();
  /**
   * Label of the action. `cancel_booking_text` is the marker for THIS button;
   * the generic `cancel_text` ("Cancel") is the dictionary's dialog/dismiss
   * word and reading it here rendered a bare "Cancel" where the design asks for
   * "Cancel booking". Until the marker exists in the CMS the fallback carries it.
   */
  const { cancel_booking_text } = dict;
  /**
   * Dialog stage: confirmation → success, refund offer or error (null = no
   * dialog). `refund` is the paid-order branch — the cancellation itself is
   * refused, so the guest is offered a refund request instead.
   */
  const [stage, setStage] = useState<
    'confirm' | 'done' | 'refund' | 'refund-done' | 'error' | null
  >(null);
  /** Reason the server refused the cancellation, shown by the error dialog */
  const [errorMessage, setErrorMessage] = useState('');
  /** Headline of the error dialog — the refund branch fails under its own name */
  const [errorTitle, setErrorTitle] = useState('Appointment not cancelled');

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
      /**
       * Surface a failed cancellation instead of falsely reporting success.
       * A paid order is the common case: the API can't undo a payment, but the
       * SDK can register a refund request — so that branch offers one instead
       * of the dead-end error dialog. Anything else keeps the error dialog.
       */
      if (isPaidOrderError(e)) {
        setStage('refund');
        return;
      }
      setErrorTitle('Appointment not cancelled');
      setErrorMessage(formatOrderCancelError(e));
      setStage('error');
      return;
    }

    /** The list refreshes itself — show the mock's success dialog. */
    setStage('done');
  }, [orderData, updateOrder]);

  /**
   * Ask the salon to refund the paid appointment.
   *
   * `createRefundRequest` wants a map `productId → { quantity }` rather than
   * the order's product array, and the whole visit is refunded — a guest has no
   * way to pick single services out of an appointment here.
   */
  const requestRefundHandle = useCallback(async () => {
    if (!orderData) return;

    const products = Object.fromEntries(
      (orderData.products ?? []).map((product) => [
        String(product.id),
        { quantity: product.quantity ?? 1 },
      ]),
    );

    try {
      await createRefundRequest({
        id: orderData.id,
        body: { products, note: 'Cancellation requested from the profile' },
      }).unwrap();
    } catch (e) {
      setErrorTitle('Refund not requested');
      setErrorMessage(formatRefundError(e));
      setStage('error');
      return;
    }

    setStage('refund-done');
  }, [orderData, createRefundRequest]);

  /**
   * Confirm-dialog visit line, mock format: "Master · DD.MM.YYYY at HH:MM".
   * Both parts are optional — missing data just shortens the line.
   */
  const masterName =
    (master?.attributeValues?.master_name?.value as string | undefined) ?? '';
  const { start } = parseOrderInterval(orderData);
  const dateLine = start
    ? `${formatUtcDate(start)} at ${formatUtcTime(start)}`
    : '';
  const subtitle = [masterName, dateLine].filter(Boolean).join(' · ');

  /* Render the cancel button and its dialogs */
  return (
    <>
      <button
        onClick={() => setStage('confirm')}
        type="button"
        data-testid="order-cancel"
        className="flex-1 rounded-lg border border-slate-150 px-3.5 py-2 text-base font-medium text-neutral-300 transition-all hover:bg-gray-50"
      >
        {(cancel_booking_text?.value as string | undefined) || 'Cancel booking'}
      </button>
      {stage === 'confirm' && (
        <CancelConfirmModal
          subtitle={subtitle}
          isPending={isLoading}
          onKeep={() => setStage(null)}
          onConfirm={cancelOrderHandle}
        />
      )}
      {stage === 'done' && <CancelSuccessModal onDone={() => setStage(null)} />}
      {stage === 'refund' && (
        <RefundRequestModal
          subtitle={subtitle}
          total={formatOrderTotal(orderData?.totalSum)}
          currency={orderData?.currency}
          isPending={isRefunding}
          onClose={() => setStage(null)}
          onConfirm={requestRefundHandle}
        />
      )}
      {stage === 'refund-done' && (
        <RefundSuccessModal onDone={() => setStage(null)} />
      )}
      {stage === 'error' && (
        <CancelErrorModal
          title={errorTitle}
          message={errorMessage}
          onClose={() => setStage(null)}
        />
      )}
    </>
  );
};

export default CancelOrderButton;
