import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX, Key } from 'react';

import { getChildPagesByParentUrl } from '@/app/api';

import CatalogCard from './CatalogCard';

/**
 * CatalogGrid component to fetch and display a grid of service catalog cards.
 *
 * This component fetches child pages under the 'services' URL and renders them
 * as a grid of CatalogCard components. Each card represents a service category.
 * @returns {Promise<JSX.Element>} JSX.Element representing the grid of catalog cards or error message
 */
const CatalogGrid = async (): Promise<JSX.Element> => {
  /** Fetch child pages by parent URL for services category */
  const { pages, isError } = await getChildPagesByParentUrl('services');
  /** Show error message if pages failed to load */
  if (!pages || isError) {
    return <div>Error loading pages.</div>;
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
