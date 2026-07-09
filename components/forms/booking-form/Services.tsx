import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import DropdownAnimations from './animations/DropdownAnimations';
import DropdownButton from './DropdownButton';
import ServicesList from './services/ServicesList';

/**
 * ServicesLayout Component.
 * @param   {object}           props          - Component properties.
 * @param   {IAttributeValues} props.dict     - dictionary from server api.
 * @param   {IPagesEntity[]}   props.services - services from server api.
 * @param   {IPagesEntity[]}   props.salons   - salons from server api.
 * @returns {JSX.Element}                     JSX.Element.
 */
const ServicesLayout = ({
  dict,
  services,
  salons,
}: {
  dict: IAttributeValues;
  services: IPagesEntity[];
  salons: IPagesEntity[];
}): JSX.Element => {
  const tabKey = 'services';

  /** Safely extract text value with nullish coalescing operator */
  const selectServiceText =
    (dict.select_service_text?.value as string | undefined) ?? 'Select Service';

  /** Render services dropdown with animations, button and list */
  return (
    <DropdownAnimations
      id={tabKey}
      className="mb-4 flex w-full flex-col items-center"
      index={1}
      tabKey={tabKey}
    >
      {/** Display dropdown button with localized title */}
      <DropdownButton title={selectServiceText} tabKey={tabKey} />
      {/** Display list of services */}
      <ServicesList services={services} salons={salons} tabKey={tabKey} />
    </DropdownAnimations>
  );
};

export default ServicesLayout;
