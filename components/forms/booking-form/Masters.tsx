'use client';

import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import DropdownAnimations from './animations/DropdownAnimations';
import DropdownButton from './DropdownButton';
import MastersList from './masters/MastersList';

/**
 * MastersLayout Component.
 * @param   {object}           props         - Component props.
 * @param   {IAttributeValues} props.dict    - dictionary for localization from server api.
 * @param   {IAdminEntity[]}   props.masters - containing masters data.
 * @returns {JSX.Element}                    JSX.Element
 */
const MastersLayout = ({
  masters,
  dict,
}: {
  masters: IAdminEntity[];
  dict: IAttributeValues;
}): JSX.Element => {
  const tabKey = 'masters';
  /** Safely extract text value with optional chaining and provide a default */
  const selectMasterText =
    (dict.select_master_text?.value as string | undefined) ?? 'Select Master';

  /** Render masters layout with dropdown animations and master list */
  return (
    <DropdownAnimations
      id={tabKey}
      className="mb-4 flex w-full flex-col items-center"
      index={3}
      tabKey={tabKey}
    >
      <DropdownButton title={selectMasterText} tabKey={tabKey} />
      <MastersList dict={dict} masters={masters} tabKey={tabKey} />
    </DropdownAnimations>
  );
};

export default MastersLayout;
