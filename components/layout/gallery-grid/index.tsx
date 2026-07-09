import { notFound } from 'next/navigation';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import {
  getAdminsInfo,
  getChildPagesByParentUrl,
  getPageByUrl,
} from '@/app/api';
import getLqipPreview from '@/components/hooks/getLqipPreview';
import { shuffleArray } from '@/components/utils';

import GalleryGrid from './components/GalleryGrid';

/**
 * Gallery component to render a grid of gallery items.
 *
 * This component fetches and processes gallery data including child pages, masters information,
 * and gallery photos. It creates a grid of gallery cards with low-quality image placeholders
 * (LQIP) for optimized loading performance. Each card links to a master's profile with a
 * specific service if available.
 * @param   {object}               props        - Component properties
 * @param   {string}               props.handle - URL handle to identify the gallery page
 * @param   {IAttributeValues}     props.dict   - Dictionary object containing localized text values
 * @returns {Promise<JSX.Element>}              JSX.Element representing the gallery grid or notFound() if data is missing
 */
const Gallery = async ({
  handle,
  dict,
}: {
  handle: string;
  dict: IAttributeValues;
}): Promise<JSX.Element> => {
  /** Fetch page data by URL handle */
  const { page, isError } = await getPageByUrl(handle);
  /** Fetch child pages for the gallery */
  const { pages: childPages } = await getChildPagesByParentUrl(handle);
  /** Fetch admin information for masters */
  const { admins } = await getAdminsInfo({ body: [], offset: 0, limit: 100 });

  /** Filter admins to get only masters with names */
  const masters = admins?.filter(
    (master: IAdminEntity) => master.attributeValues?.master_name && master,
  );

  /** Return 404 page if required data is missing */
  if (!childPages || !masters || !page || isError) {
    return notFound();
  }

  /** Extract master IDs and photos from child pages */
  const data =
    childPages.map((page: IPagesEntity) => {
      const masterIdArr = page?.attributeValues?.master_id?.value as
        Array<{ value: number }> | undefined;
      return {
        masterId: masterIdArr?.[0]?.value,
        photos: page?.attributeValues?.gallery_photos?.value as
          Array<{ previewLink?: string; downloadLink: string }> | undefined,
      };
    }) || [];

  /** Process gallery data to create card information with master details */
  const cardsData = await Promise.all(
    data.flatMap(async (gallery) => {
      /** Find master information by ID */
      const master = masters?.find((m) => m.id === Number(gallery.masterId));
      if (!master || !gallery.photos) {
        return [];
      }

      /** Extract gallery category specification */
      const specArr = page.attributeValues?.gallery_category?.value as
        Array<{ id: number }> | undefined;
      const spec = specArr?.[0];
      /** Get master name with fallback to empty string */
      const masterName =
        (master.attributeValues?.master_name?.value as string | undefined) ||
        '';

      /** Initialize link with master ID path */
      let link = `/masters/${master.id}`;
      /** Append service parameter if category ID exists */
      if (spec?.id) {
        link += '?service=' + spec.id;
      }

      /** Map through photos and create card data with LQIP previews */
      return await Promise.all(
        gallery.photos.map(async (imgSrc) => {
          /** Determine image URL from preview or download link */
          const imageUrl = imgSrc.previewLink || imgSrc.downloadLink;
          /** Generate low-quality image preview for lazy loading */
          const preview = await getLqipPreview(imageUrl);

          /** Return card data object with all required properties */
          return {
            name: masterName,
            link,
            img: imgSrc.downloadLink,
            thumb: imageUrl,
            preview, // This will be null if LQIP generation failed, which is handled gracefully
            spec,
          };
        }),
      );
    }),
  );

  /** Shuffle the data on the server side before passing to client component */
  const shuffledCardsData = shuffleArray(cardsData.flat());

  /** Render gallery grid with shuffled card data */
  return (
    <div className="grid w-full grid-cols-6 gap-0 max-2xl:grid-cols-5 max-lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2">
      <GalleryGrid dict={dict} cardsData={shuffledCardsData} />
    </div>
  );
};

export default Gallery;
