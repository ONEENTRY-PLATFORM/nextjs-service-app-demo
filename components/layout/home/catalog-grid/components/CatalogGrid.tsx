import { Link } from 'next-transition-router';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX, Key } from 'react';

import { getChildPagesByParentUrl } from '@/app/api';

import CatalogCard from './CatalogCard';
import CategoryTile, { CATEGORY_TILES } from './CategoryTile';

/**
 * CatalogGrid component to fetch and display a grid of service catalog cards.
 *
 * This component fetches child pages under the 'services' URL and renders them
 * as a grid of CatalogCard components. Each card represents a service category.
 * While no categories exist in the CMS yet, it renders the four mock category
 * tiles (hair / face / body / nails) linking to the services page.
 * @returns {Promise<JSX.Element>} JSX.Element representing the grid of catalog cards or error message
 */
const CatalogGrid = async (): Promise<JSX.Element> => {
  /** Fetch child pages by parent URL for services category */
  const { pages, isError } = await getChildPagesByParentUrl('services');
  /** Show error message if pages failed to load */
  if (!pages || isError) {
    return <div>Error loading pages.</div>;
  }

  /** Placeholder tiles until the service categories are created in the CMS */
  if (pages.length === 0) {
    return (
      <>
        {Object.keys(CATEGORY_TILES).map((tile) => (
          <Link
            key={tile}
            href="/services"
            title={tile}
            className="z-10 block transition-transform duration-300 hover:scale-105 focus:outline-none"
          >
            <div className="size-36 md:size-44 lg:size-56">
              <CategoryTile tile={tile} suffix={`placeholder_${tile}`} />
            </div>
          </Link>
        ))}
      </>
    );
  }

  /** Render catalog cards for each service page */
  return (
    <>
      {pages.map((page: IPagesEntity, i: Key) => {
        return <CatalogCard item={page} key={i} index={i as number} />;
      })}
    </>
  );
};

export default CatalogGrid;
