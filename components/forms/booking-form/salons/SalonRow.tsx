/* eslint-disable jsdoc/no-undefined-types */
'use client';

import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

export type TabLayoutProps = {
  salon: IPagesEntity;
  currentId: number;
  disabled: boolean;
  index: number;
  addSalonToCart: (salon: IPagesEntity, disabled: boolean) => void;
};

/**
 * Renders a salon row component with selection functionality.
 * @param   {TabLayoutProps}                    props                - Component props
 * @param   {IPagesEntity}                      props.salon          - The salon entity to display.
 * @param   {number}                            props.currentId      - The ID of the currently selected salon.
 * @param   {boolean}                           props.disabled       - Flag indicating if the component is disabled.
 * @param   {Dispatch<SetStateAction<boolean>>} props.addSalonToCart - Function to add the salon to cart when selected.
 * @returns {JSX.Element}                                            JSX element representing the salon row.
 */
const SalonRow = ({
  salon,
  currentId,
  disabled,
  addSalonToCart,
}: TabLayoutProps): JSX.Element => {
  const isSelected = currentId === salon?.id;

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

  /* Render salon row with conditional styling and click handler */
  return (
    <div className="dropdown-item flex border-b border-b-slate-250">
      <button
        onClick={() => !isDisabled && addSalonToCart(salon, isDisabled)}
        className={buttonClassName}
        disabled={isDisabled}
      >
        {salon.localizeInfos?.title || ''}
      </button>
    </div>
  );
};

export default SalonRow;
