/* eslint-disable jsdoc/reject-function-type */
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';
import type { Dispatch, JSX, SetStateAction } from 'react';

/**
 * Edit Order Button Component
 * @param   {object}               props              - The component props.
 * @param   {IOrderByMarkerEntity} props.orderData    - The order data to be edited.
 * @param   {IAttributeValues}     props.dict         - Dictionary for localized text values.
 * @param   {Function}             props.setEditState - Function to set the edit state with the order data.
 * @returns {JSX.Element}                             JSX.Element
 */
const EditOrderButton = ({
  orderData,
  dict,
  setEditState,
}: {
  orderData?: IOrderByMarkerEntity;
  dict: IAttributeValues;
  setEditState: Dispatch<SetStateAction<IOrderByMarkerEntity | undefined>>;
}): JSX.Element => {
  /** Handle the edit order action by setting the edit state with current order data */
  const handleEditOrder = () => {
    if (orderData) {
      setEditState(orderData);
    }
  };

  return (
    <button
      onClick={handleEditOrder}
      type="button"
      className="h-10 min-w-20 items-center justify-center rounded-3xl border border-solid border-fuchsia-500 bg-transparent p-1 text-base leading-6 font-bold tracking-wide text-fuchsia-500 transition-colors duration-300 hover:border-fuchsia-600 hover:text-fuchsia-600 focus-visible:text-fuchsia-600 focus-visible:outline-fuchsia-600 disabled:border-neutral-300 disabled:text-neutral-300"
    >
      {(dict.edit_text?.value as string | undefined) || 'Edit'}
    </button>
  );
};

export default EditOrderButton;
