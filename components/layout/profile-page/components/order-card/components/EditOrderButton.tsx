/* eslint-disable jsdoc/reject-function-type */
import type { IAttributeValues, IOrderByMarkerEntity } from 'oneentry/types';
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
      className="flex-1 rounded-lg bg-gradient-brand py-2 text-base font-bold text-white transition-all hover:opacity-90"
    >
      {(dict.edit_text?.value as string | undefined) || 'Edit'}
    </button>
  );
};

export default EditOrderButton;
