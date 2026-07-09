'use client';

import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import DropdownAnimations from './animations/DropdownAnimations';
import DropdownButton from './DropdownButton';
import SalonsList from './salons/SalonsList';

/**
 * Salons Component.
 * @param   {object}           props        - Component properties.
 * @param   {IPagesEntity[]}   props.salons - Salons data.
 * @param   {IAttributeValues} props.dict   - dictionary from server api.
 * @returns {JSX.Element}                   JSX.Element.
 */
const Salons = ({
  dict,
  salons,
}: {
  dict: IAttributeValues;
  salons: IPagesEntity[];
}): JSX.Element => {
  const tabKey = 'salons';
  /** Extracting text value safely with optional chaining */
  const selectSalonText =
    (dict.select_salon_text?.value as string | undefined) || 'Select Salon';

  /** Render salons dropdown with animations, button and list */
  return (
    <DropdownAnimations
      id={tabKey}
      index={0}
      className="mb-4 flex w-full flex-col items-center"
      tabKey={tabKey}
    >
      {/** Display dropdown button with localized title */}
      <DropdownButton title={selectSalonText} tabKey={tabKey} />
      {/** Display list of salons */}
      <SalonsList salons={salons} tabKey={tabKey} />
    </DropdownAnimations>
  );
};

export default Salons;
