import { notFound } from 'next/navigation';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import { getChildPagesByParentUrl, getPageByUrl } from '@/app/api';
import { getMastersList } from '@/app/api/utils/getMastersList';
import getLqipPreview from '@/components/hooks/getLqipPreview';
import type { OneEntryImageFile } from '@/components/utils';
import { getGalleryImageUrls, shuffleArray } from '@/components/utils';

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
  const { admins } = await getMastersList();

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
          OneEntryImageFile[] | undefined,
      };
    }) || [];

  /** Process gallery data to create card information with master details */
  const cardsData = await Promise.all(
    data.flatMap(async (gallery) => {
      /** Photos are required; the master link is optional. */
      if (!gallery.photos) {
        return [];
      }
      /**
       * Find master information by ID — may be absent while `master_id` is
       * not linked yet; photos still render without a profile link.
       */
      const master = masters?.find((m) => m.id === Number(gallery.masterId));

      /**
       * Extract gallery category specification. An `entity` attribute value is
       * `[{ title, value: { id, parentId, … } }]` (OneEntry `IListTitleEntityValue`)
       * — the linked service page id lives in `value.id`, same shape as
       * `master_services` in `app/masters/page.tsx`.
       */
      const specArr = page.attributeValues?.gallery_category?.value as
        Array<{ title?: string; value?: { id?: number } }> | undefined;
      const specRaw = specArr?.[0];
      const specId = specRaw?.value?.id;
      const spec = specRaw ? { id: specId, title: specRaw.title } : undefined;
      /** Master name + profile link only when a master is linked */
      const masterName =
        (master?.attributeValues?.master_name?.value as string | undefined) ||
        '';

      /** Link to the master profile only when a master is linked */
      let link = master ? `/masters/${master.id}` : '';
      /** Append service parameter if both a master and category id exist */
      if (link && specId) {
        link += '?service=' + specId;
      }

      /** Map through photos and create card data with LQIP previews */
      return await Promise.all(
        gallery.photos.map(async (photo) => {
          /** Normalize inconsistent `previewLink` shapes into plain URL strings */
          const { full, thumb, blur } = getGalleryImageUrls(photo);
          /** Reuse the ready-made blur, else generate a low-quality preview */
          const preview = blur ?? (await getLqipPreview(thumb));

          /** Return card data object with all required properties */
          return {
            name: masterName,
            link,
            img: full,
            thumb,
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
