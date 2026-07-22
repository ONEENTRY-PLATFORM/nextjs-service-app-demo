import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';
import type { JSX } from 'react';

import {
  ORDERS_STATUS_COMPLETED,
  ORDERS_STATUS_UPCOMING,
} from '@/app/store/orderMarkers';

import CancelOrderButton from './CancelOrderButton';
import LeaveReviewButton from './LeaveReviewButton';
import RepeatOrder from './RepeatOrder';
import RescheduleOrderButton from './RescheduleOrderButton';

/**
 * Order buttons group — the per-status action pairs of the static-html mock
 * (`AccountPage.tsx` → `VisitRow`): upcoming visits offer "Reschedule" +
 * "Cancel booking", completed ones "Book Again" + "Leave a review", and a
 * cancelled one only "Book Again" (right-aligned).
 *
 * Rescheduling reopens the booking wizard prefilled rather than editing the
 * appointment in place: the in-card edit mode (`EditOrderButton` /
 * `SaveOrderButton`, both kept on disk) had no way to pick a new day, which is
 * the whole point of moving a visit.
 * @param   {object}               props        - OrderCard Props
 * @param   {IAttributeValues}     props.dict   - Dictionary containing localized strings
 * @param   {IOrderByMarkerEntity} props.order  - Order information to display
 * @param   {IAdminEntity}         props.master - Master information associated with the order
 * @returns {JSX.Element}                       JSX.Element
 */
const OrderButtonsGroup = ({
  dict,
  order,
  master,
}: {
  dict: IAttributeValues;
  order: IOrderByMarkerEntity;
  master: IAdminEntity;
}): JSX.Element => {
  /** Extract the status identifier from the order to determine which buttons to show */
  const { statusIdentifier } = order;

  return (
    /** Full-width action row below the order details */
    <>
      {/* Conditional rendering based on order status */}
      {statusIdentifier === ORDERS_STATUS_UPCOMING ? (
        /** Upcoming visits: move the appointment or call it off */
        <>
          <RescheduleOrderButton dict={dict} orderData={order} />
          <CancelOrderButton dict={dict} orderData={order} master={master} />
        </>
      ) : statusIdentifier === ORDERS_STATUS_COMPLETED ? (
        /** Completed visits: book again + leave a review (mock pair) */
        <>
          <div className="flex-1">
            <RepeatOrder dict={dict} orderData={order} />
          </div>
          <LeaveReviewButton />
        </>
      ) : (
        /** Canceled orders: only offer to book again, right-aligned as in the mock */
        <div className="ml-auto">
          <RepeatOrder dict={dict} orderData={order} />
        </div>
      )}
    </>
  );
};

export default OrderButtonsGroup;
