/* eslint-disable jsdoc/reject-function-type */
'use client';

import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

/**
 * Service selection row component.
 * @param   {object}       props                   - Component props.
 * @param   {IPagesEntity} props.service           - Page entity object representing a service item.
 * @param   {number}       props.currentId         - Currently selected service ID.
 * @param   {boolean}      props.disabled          - Whether in disabled state.
 * @param   {IAdminEntity} props.master            - Master service object.
 * @param   {Function}     props.addCategoryToCart - Callback function to add service to cart.
 * @returns {JSX.Element}                          JSX element displaying a service option button.
 */
const ServicesRow = ({
  service,
  currentId,
  disabled,
  master,
  addCategoryToCart,
}: {
  service: IPagesEntity;
  currentId?: number;
  disabled: boolean;
  master: IAdminEntity;
  addCategoryToCart: (
    service: IPagesEntity,
    disabled: boolean,
    master: IAdminEntity,
  ) => void;
}): JSX.Element => {
  /** Check if the current service is selected */
  const isSelected = currentId === service?.id;
  /** Set button style class name based on state */
  const baseClassName =
    'py-2 w-full focus:text-fuchsia-500 hover:text-fuchsia-500 ';
  const disabledClassName =
    'text-fuchsia-100 hover:text-fuchsia-100 focus:text-fuchsia-100 ';
  const selectedClassName = 'text-fuchsia-500 ';
  const buttonClassName =
    baseClassName +
    (disabled ? disabledClassName : isSelected ? selectedClassName : '');

  /** Ensure consistent boolean value for disabled prop */
  const isDisabled = Boolean(disabled);

  return (
    <div className="dropdown-item flex border-b border-b-slate-250">
      <button
        onClick={() => addCategoryToCart(service, isDisabled, master)}
        className={buttonClassName}
        disabled={isDisabled}
      >
        {service.localizeInfos?.title || ''}
      </button>
    </div>
  );
};

export default ServicesRow;
