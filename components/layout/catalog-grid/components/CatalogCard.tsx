import { Link } from 'next-transition-router';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import CardAnimations from '../animations/CardAnimations';
import CatalogCardIcon from './CatalogCardIcon';
import CatalogCardTitle from './CatalogCardTitle';

/**
 * CatalogCard component representing a single service category card in the catalog grid.
 *
 * This component displays a circular card with an icon and title for a service category.
 * It links to the specific service page and includes animation effects.
 * @param   {object}       props       - Component properties.
 * @param   {IPagesEntity} props.item  - The page entity data containing service information.
 * @param   {number}       props.index - Index for animation sequencing.
 * @returns {JSX.Element}              JSX.Element representing the CatalogCard.
 */
const CatalogCard = ({
  item,
  index,
}: {
  item: IPagesEntity;
  index: number;
}): JSX.Element => {
  /** Extract localized information and page URL from item */
  const { localizeInfos, pageUrl } = item;

  /** Render animated catalog card with link, icon and title */
  return (
    <CardAnimations className={'relative flex shrink-0 flex-col'} index={index}>
      <Link
        title={localizeInfos?.title}
        href={`/services/${pageUrl}`}
        className="z-10 flex size-57.5 flex-col items-center justify-center gap-2 overflow-hidden rounded-full p-8 text-center text-xl text-neutral-600 transition-colors duration-300 hover:text-fuchsia-600 max-xl:size-50 max-xs:size-32.5 max-md:size-40 max-md:p-6 max-sm:size-35 max-sm:p-5"
      >
        {/** Display catalog card icon */}
        <CatalogCardIcon item={item} />
        {/** Display catalog card title */}
        <CatalogCardTitle item={item} />
      </Link>
    </CardAnimations>
  );
};

export default CatalogCard;
