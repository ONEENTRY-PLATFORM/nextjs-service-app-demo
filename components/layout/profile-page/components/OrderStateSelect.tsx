'use client';

import type { ChangeEvent, Dispatch, JSX, SetStateAction } from 'react';

import { orderStates } from '@/components/data';

/**
 * Dropdown select element for choosing order state
 * @param   {object}                           props               - Component properties
 * @param   {string}                           props.orderState    - Current selected order state value
 * @param   {Dispatch<SetStateAction<string>>} props.setOrderState - Function to update the selected order state
 * @returns {JSX.Element}                                          JSX element representing the order state select dropdown
 */
const OrderStateSelect = ({
  orderState,
  setOrderState,
}: {
  orderState: string; // Current selected order state value
  setOrderState: Dispatch<SetStateAction<string>>; // Function to update the order state
}): JSX.Element => {
  /**
   * Dropdown select element for choosing order state
   * @param {ChangeEvent<HTMLSelectElement>} e - Change event object
   */
  return (
    <select
      onChange={(e: ChangeEvent<HTMLSelectElement>) => {
        /** Update the order state when selection changes */
        setOrderState(e.target.value);
      }}
      defaultValue={orderState}
      className="mb-6 flex w-40 cursor-pointer gap-5 border-none py-1.5 text-lg text-gray-400"
    >
      {/* Map through all available order states and create options */}
      {orderStates.map((orderState, i) => {
        return (
          <option key={i} value={orderState.value}>
            {orderState.title}
          </option>
        );
      })}
    </select>
  );
};

export default OrderStateSelect;
