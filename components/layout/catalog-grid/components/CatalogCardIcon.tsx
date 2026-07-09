import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import * as icons from '@/components/icons/catalog/index';

/**
 * CatalogCardIcon component to display a service category icon.
 *
 * This component dynamically selects and displays an appropriate icon
 * based on the page URL of the service category. It uses a mapping of
 * page URLs to icon components from the catalog icons directory.
 * @param   {object}       props      - Component properties
 * @param   {IPagesEntity} props.item - Page entity containing the pageUrl used to determine which icon to display
 * @returns {JSX.Element}             JSX.Element representing the catalog card icon or empty string if no matching icon
 */
const CatalogCardIcon = ({ item }: { item: IPagesEntity }): JSX.Element => {
  const { pageUrl } = item;

  /** Safely access the icon using the pageUrl */
  const IconComponent = icons[pageUrl as keyof typeof icons];

  /** Render icon component or empty string if not found */
  return (
    <div className="mx-auto size-24 max-md:size-20 max-sm:size-16">
      {IconComponent ? <IconComponent /> : ''}
    </div>
  );
};

export default CatalogCardIcon;
