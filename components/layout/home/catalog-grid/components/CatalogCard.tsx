import { Link } from 'next-transition-router';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import CardAnimations from '../animations/CardAnimations';
import CatalogCardIcon from './CatalogCardIcon';
import CatalogCardTitle from './CatalogCardTitle';
import CategoryTile, { categoryTileKey } from './CategoryTile';

/**
 * CatalogCard component representing a single service category card in the catalog grid.
 *
 * For the four main categories (hair / face / body / nails) it renders the
 * complete tile from the ICONS_CATEGORY.svg sprite (outlined circle + icon +
 * label), as in the static-html mock's SERVICE section. Other categories fall
 * back to the icon + title circle card.
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

  /** Tile key from the mock sprite, when the category is one of the four main ones */
  const tile = categoryTileKey(pageUrl, localizeInfos?.title);

  if (tile) {
    return (
      <CardAnimations
        className={'relative flex shrink-0 flex-col'}
        index={index}
      >
        <Link
          prefetch={false}
          title={localizeInfos?.title}
          href={`/services/${pageUrl}`}
          className="z-10 block transition-transform duration-300 hover:scale-105 focus:outline-none"
        >
          <div className="size-36 md:size-44 lg:size-56">
            <CategoryTile tile={tile} suffix={`${tile}_${index}`} />
          </div>
        </Link>
      </CardAnimations>
    );
  }

  /** Render animated catalog card with link, icon and title */
  return (
    <CardAnimations className={'relative flex shrink-0 flex-col'} index={index}>
      <Link
        prefetch={false}
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
