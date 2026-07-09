/* eslint-disable jsdoc/reject-function-type */
'use client';

import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import MasterRowData from './MasterRowData';
import MasterRowImage from './MasterRowImage';

/**
 * MasterRow component renders a selectable master row in the booking form.
 * @param   {object}           props                 - Component props
 * @param   {IAttributeValues} props.dict            - Dictionary of attribute values.
 * @param   {IAdminEntity}     props.master          - Master entity.
 * @param   {IPagesEntity}     props.serviceCategory - Service category page entity.
 * @param   {number}           props.currentId       - Current master id.
 * @param   {Function}         props.addMasterToCart - Add master to cart.
 * @returns {JSX.Element}                            MasterRow.
 */
const MasterRow = ({
  dict,
  master,
  serviceCategory,
  currentId,
  addMasterToCart,
}: {
  dict: IAttributeValues;
  master: IAdminEntity;
  serviceCategory: IPagesEntity | undefined;
  currentId: number;
  addMasterToCart: (master: IAdminEntity) => void;
}): JSX.Element => {
  return (
    <label
      htmlFor={`radio-${master.id}`}
      onClick={() => addMasterToCart(master)}
      className="dropdown-item card-label flex w-full cursor-pointer items-start justify-between gap-5 rounded-2xl border border-transparent pr-2.5 transition-colors duration-300 hover:border-fuchsia-500"
    >
      <MasterRowImage master={master} />
      <MasterRowData
        dict={dict}
        master={master}
        serviceCategory={serviceCategory}
        currentId={currentId}
      />
    </label>
  );
};

export default MasterRow;
