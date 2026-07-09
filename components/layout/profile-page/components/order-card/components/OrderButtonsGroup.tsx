import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';
import type { Dispatch, JSX, SetStateAction } from 'react';
import { useState } from 'react';

import CancelOrderButton from './CancelOrderButton';
import EditOrderButton from './EditOrderButton';
import OrderStatus from './OrderStatus';
import RepeatOrder from './RepeatOrder';
import SaveOrderButton from './SaveOrderButton';

/**
 * Order buttons group
 * @param   {object}                            props            - OrderCard Props
 * @param   {IAttributeValues}                  props.dict       - Dictionary data
 * @param   {IOrderByMarkerEntity}              props.order      - Order data
 * @param   {IAdminEntity}                      props.master     - Master data
 * @param   {Dispatch<SetStateAction<boolean>>} props.setRefetch - Set refetch state
 * @returns {JSX.Element}                                        JSX.Element
 */
const OrderButtonsGroup = ({
  dict,
  order,
  setRefetch,
}: {
  dict: IAttributeValues; // Dictionary containing localized strings
  order: IOrderByMarkerEntity; // Order information to display
  master: IAdminEntity; // Master information associated with the order
  setRefetch: Dispatch<SetStateAction<boolean>>; // Function to trigger data refetch
}): JSX.Element => {
  /** Extract the status identifier from the order to determine which buttons to show */
  const { statusIdentifier } = order;

  /** State to track if we're in edit mode for the order */
  const [editState, setEditState] = useState<IOrderByMarkerEntity>();

  return (
    /** Container for the order action buttons (30% width of parent) */
    <div
      className={`flex w-[30%] flex-col gap-3 text-base font-bold tracking-wide`}
    >
      {/* Conditional rendering based on order status */}
      {statusIdentifier === 'upcoming' ? (
        /** For upcoming orders, show edit/cancel options */
        <>
          {editState ? (
            /** If in edit mode, show save button */
            <SaveOrderButton
              dict={dict}
              orderData={editState}
              setEditState={setEditState}
              setRefetch={setRefetch}
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
          <CancelOrderButton
            dict={dict}
            orderData={order}
            setRefetch={setRefetch}
          />
        </>
      ) : statusIdentifier === 'canceled' ? (
        /** For canceled orders, show status indicator */
        <OrderStatus statusIdentifier={statusIdentifier} />
      ) : (
        /** For other statuses (completed, etc.), show repeat order button */
        <RepeatOrder dict={dict} orderData={order} />
      )}
    </div>
  );
};

export default OrderButtonsGroup;
