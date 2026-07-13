import parse from 'html-react-parser';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import wrapCharactersInSpan from '@/components/hooks/wrapCharactersInSpan';

/**
 * CatalogCardTitle component to display the title of a catalog card.
 *
 * This component renders the title of a service category card in the catalog grid.
 * It wraps each character in a span for animation purposes and parses any HTML in the title.
 * @param   {object}       props      - Component properties
 * @param   {IPagesEntity} props.item - Page entity containing the localized title information
 * @returns {JSX.Element}             JSX.Element representing the formatted catalog card title
 */
const CatalogCardTitle = ({ item }: { item: IPagesEntity }): JSX.Element => {
  /** Wrap title characters in spans for animation effects with fallback */
  const title = wrapCharactersInSpan(
    item.localizeInfos?.title || 'No Title Available',
  );

  /** Render wrapped title with proper styling */
  return (
    <div className="title mx-auto items-center whitespace-nowrap uppercase max-md:text-sm">
      {parse(title)}
    </div>
  );
};

export default CatalogCardTitle;
