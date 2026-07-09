import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import getLqipPreview from '@/components/hooks/getLqipPreview';
import Spinner from '@/components/shared/Spinner';

import GalleryCardSm from './components/GalleryCardSm';

/**
 * GalleryCatsGrid
 * @param   {object}               props         - Component props
 * @param   {IPagesEntity[]}       [props.pages] - Array of page entities containing gallery information
 * @returns {Promise<JSX.Element>}               Grid of gallery cards based on the provided pages
 */
const GalleryCatsGrid = async ({
  pages,
}: {
  pages?: IPagesEntity[];
}): Promise<JSX.Element> => {
  /** Return spinner if no pages are provided or array is empty */
  if (!pages || pages.length < 1) {
    return <Spinner />;
  }

  /** Create an array of promises to fetch preview data for each gallery item */
  const cardDataPromises = pages.map(async (p: IPagesEntity) => {
    const thumbArr = p.attributeValues?.gallery_cat_thumb?.value as
      Array<{ previewLink: string; downloadLink: string }> | undefined;
    const thumb = thumbArr?.[0] ?? { previewLink: '', downloadLink: '' };
    /** Extract preview link from gallery category thumbnail */
    const previewLink = thumb.previewLink;
    /** Extract download link from gallery category thumbnail */
    const downloadLink = thumb.downloadLink;

    /** Return card data object with title, href, thumbnail and preview image */
    return {
      title: p.localizeInfos?.title || '',
      href: '/gallery/' + p.pageUrl,
      thumb,
      preview: (await getLqipPreview(previewLink || downloadLink)) || '',
    };
  });

  /** Wait for all preview data to be resolved */
  const cardDataArray = await Promise.all(cardDataPromises);

  /** Render gallery cards with resolved preview data */
  return (
    <>
      {cardDataArray.map((cardData, index) => (
        <GalleryCardSm key={index} cardData={cardData} index={index} />
      ))}
    </>
  );
};

export default GalleryCatsGrid;
