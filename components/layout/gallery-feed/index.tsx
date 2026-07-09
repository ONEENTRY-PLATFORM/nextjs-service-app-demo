import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { ILocalizeInfo } from 'oneentry/dist/base/utils';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import TitleAnimations from '@/app/animations/TitleAnimations';
import { getChildPagesByParentUrl } from '@/app/api';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import getLqipPreview from '@/components/hooks/getLqipPreview';
import { shuffleArray } from '@/components/utils';

import GalleryCarousel from './components/GalleryCarousel';

/**
 * Gallery Feed section
 * @param   {object}               props       - Gallery feed block
 * @param   {IBlockEntity}         props.block - Block entity
 * @returns {Promise<JSX.Element>}             React component
 */
const GalleryFeed = async ({
  block,
}: {
  block: IBlockEntity;
}): Promise<JSX.Element> => {
  const [dict] = ServerProvider<IAttributeValues>('dict');

  /** Fetch child pages for the gallery and their respective child pages concurrently */
  const parentPagesResponse = await getChildPagesByParentUrl('gallery');
  /** Extract parent pages from response with fallback to empty array */
  const parentPages = parentPagesResponse?.pages || [];

  /** Create promises to fetch gallery data for each parent page */
  const galleryDataPromises = parentPages.map(fetchGalleryData);
  /** Resolve all gallery data promises and flatten results */
  const galleryData = (await Promise.all(galleryDataPromises)).flat();
  /** Shuffle gallery data and take first 10 items for feed */
  const feedCards = shuffleArray(galleryData).slice(0, 10);

  /** Render gallery feed section with title and carousel */
  return (
    <section className="flex w-screen flex-col justify-center py-5">
      <div className="flex w-full flex-col">
        <TitleAnimations
          delay={0.5}
          className="mx-auto mb-12 flex w-auto flex-col gap-4"
        >
          {/** Display gallery feed section title */}
          <h2 className="title self-center text-4xl leading-8 font-light text-gray-600 uppercase">
            {block?.localizeInfos?.title}
          </h2>
          <hr className="relative mb-2.5 h-px w-full max-w-37.5 self-center border-b border-solid border-b-gray-600" />
        </TitleAnimations>
        {/** Render gallery carousel with feed cards */}
        <div className="flex flex-col gap-0">
          <GalleryCarousel cards={feedCards} dict={dict} />
        </div>
      </div>
    </section>
  );
};

type FeedCard = {
  name: string;
  link: string;
  img: string;
  thumb: string;
  preview: string | null;
  spec: ILocalizeInfo;
};

/**
 * Fetch gallery data for a specific parent page
 * @param   {IPagesEntity}        parentPage - Parent page entity
 * @returns {Promise<FeedCard[]>}            Promise that resolves to array of gallery card data
 */
async function fetchGalleryData(parentPage: IPagesEntity): Promise<FeedCard[]> {
  const { pages: childPages } = await getChildPagesByParentUrl(
    parentPage.pageUrl,
  );
  const promises = childPages?.flatMap(extractPhotosFromPage(parentPage)) || [];
  const resolved = await Promise.all(promises);
  return resolved.filter((c): c is FeedCard => c !== null);
}

type PhotoExtractor = (page: IPagesEntity) => Promise<FeedCard | null>[];

/**
 * Helper function to extract photos from a page entity.
 * @param   {IPagesEntity}   parentPage - Parent page entity
 * @returns {PhotoExtractor}            Per-page photo mapper
 */
function extractPhotosFromPage(parentPage: IPagesEntity): PhotoExtractor {
  return (page: IPagesEntity) => {
    /** Extract master ID from page attribute values */
    const masterIdArr = page.attributeValues?.master_id?.value as
      Array<{ value: number; title?: string }> | undefined;
    const masterId = masterIdArr?.[0]?.value;
    /** Get photos array from page gallery photos attribute with fallback to empty array */
    const photos =
      (page?.attributeValues?.gallery_photos?.value as
        Array<{ previewLink: string; downloadLink: string }> | undefined) || [];
    /** Initialize link with master ID path */
    let link = `/masters/${masterId}`;
    /** Extract gallery category ID from parent page */
    const galleryCatArr = parentPage.attributeValues.gallery_category?.value as
      Array<{ id: number }> | undefined;
    const idx = galleryCatArr?.[0]?.id;
    /** Append service parameter to link if category ID exists */
    if (idx) {
      link += `?service=${idx}`;
    }
    /** Map through photos to create photo objects with preview data */
    return photos.map(async (photo) => {
      /** Determine image source URL from preview or download link */
      const imgSrc = photo.previewLink || photo.downloadLink;

      /** Return null if no image source is available */
      if (!imgSrc) return null;

      /** Generate low-quality image preview for lazy loading */
      const preview = await getLqipPreview(imgSrc);

      /** Return photo object with all required properties */
      return {
        name: masterIdArr?.[0]?.title || '',
        link,
        img: photo.downloadLink,
        thumb: photo.previewLink || photo.downloadLink,
        preview,
        spec: parentPage.localizeInfos,
      };
    });
  };
}

export default GalleryFeed;
