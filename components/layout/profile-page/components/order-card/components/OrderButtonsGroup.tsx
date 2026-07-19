import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';
import type { JSX } from 'react';
import { useState } from 'react';

import {
  ORDERS_STATUS_COMPLETED,
  ORDERS_STATUS_UPCOMING,
} from '@/app/store/orderMarkers';

import CancelOrderButton from './CancelOrderButton';
import EditOrderButton from './EditOrderButton';
import LeaveReviewButton from './LeaveReviewButton';
import RepeatOrder from './RepeatOrder';
import SaveOrderButton from './SaveOrderButton';

/**
 * Order buttons group
 * @param   {object}               props        - OrderCard Props
 * @param   {IAttributeValues}     props.dict   - Dictionary data
 * @param   {IOrderByMarkerEntity} props.order  - Order data
 * @param   {IAdminEntity}         props.master - Master data
 * @returns {JSX.Element}                       JSX.Element
 */
const OrderButtonsGroup = ({
  dict,
  order,
  master,
}: {
  dict: IAttributeValues; // Dictionary containing localized strings
  order: IOrderByMarkerEntity; // Order information to display
  master: IAdminEntity; // Master information associated with the order
}): JSX.Element => {
  /** Extract the status identifier from the order to determine which buttons to show */
  const { statusIdentifier } = order;

  /** State to track if we're in edit mode for the order */
  const [editState, setEditState] = useState<IOrderByMarkerEntity>();

  return (
    /** Full-width action row below the order details */
    <div className="flex w-full gap-2 text-base font-bold tracking-wide">
      {/* Conditional rendering based on order status */}
      {statusIdentifier === ORDERS_STATUS_UPCOMING ? (
        /** For upcoming orders, show edit/save + cancel options */
        <>
          {editState ? (
            /** If in edit mode, show save button */
            <SaveOrderButton
              dict={dict}
              orderData={editState}
              setEditState={setEditState}
            />
          ) : (
            /** If not in edit mode, show edit button */
            <EditOrderButton
              dict={dict}
              orderData={order}
              setEditState={setEditState}
            />
          )}
          {/* Always show cancel button for upcoming orders */}
          <CancelOrderButton dict={dict} orderData={order} master={master} />
        </>
      ) : statusIdentifier === ORDERS_STATUS_COMPLETED ? (
        /** Completed visits: book again + leave a review (mock pair) */
        <>
          <RepeatOrder dict={dict} orderData={order} />
          <LeaveReviewButton />
        </>
      ) : (
        /** Canceled orders: only offer to book again */
        <RepeatOrder dict={dict} orderData={order} />
      )}
    </div>
  );
};

export default OrderButtonsGroup;
