import type { ILocalizeInfo } from 'oneentry/dist/base/utils';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import { getChildPagesByParentUrl } from '@/app/api/server/pages/getChildPagesByParentUrl';
import { getMastersList } from '@/app/api/utils/getMastersList';
import masterNamesById from '@/app/gallery/masterNamesById';
import SectionTitle from '@/components/shared/SectionTitle';
import type { OneEntryImageFile } from '@/components/utils';
import { getGalleryImageUrls, shuffleArray } from '@/components/utils';

import GalleryGrid from './components/GalleryGrid';

/**
 * Gallery Feed section
 * @param   {object}               props       - Gallery feed block
 * @param   {IBlockEntity}         props.block - Block entity
 * @returns {Promise<JSX.Element>}             React component
 */
const GalleryFeed = async ({
  block,
}: {
  block?: IBlockEntity | undefined;
}): Promise<JSX.Element> => {
  /** The gallery tree and the master admins are independent — fetch in parallel. */
  const [parentPagesResponse, { admins }] = await Promise.all([
    getChildPagesByParentUrl('gallery'),
    getMastersList(),
  ]);
  /** Extract parent pages from response with fallback to empty array */
  const parentPages = parentPagesResponse?.pages || [];

  /** Admin id → `master_name`, empty when the admins request failed */
  const mastersById = masterNamesById(admins);

  /** Create promises to fetch gallery data for each parent page */
  const galleryDataPromises = parentPages.map((parentPage) =>
    fetchGalleryData(parentPage, mastersById),
  );
  /** Resolve all gallery data promises and flatten results */
  const galleryData = (await Promise.all(galleryDataPromises)).flat();

  /** Shuffle the CMS gallery cards and take the mock's six-tile strip */
  const feedCards = shuffleArray(galleryData).slice(0, 6);

  /** Section heading; falls back to the mock's "Gallery" when the block is not filled */
  const title = block?.localizeInfos?.title || 'Gallery';

  /**
   * Nothing in the CMS gallery tree → drop the whole strip rather than render a
   * titled section with an empty grid (the section degrades away, not to a mock).
   */
  if (feedCards.length === 0) {
    return <></>;
  }

  /** Render gallery feed section with title and photo grid */
  return (
    <section
      className="flex w-full flex-col justify-center pt-0 pb-3 xl:pb-10 md:pb-4"
      data-testid="home-gallery"
    >
      <div className="flex w-full flex-col">
        <SectionTitle title={title} delay={0.5} className="mb-6 md:mb-10" />
        {/** Render the static six-tile gallery grid (static-html mock) */}
        <GalleryGrid cards={feedCards} />
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
 * @param   {IPagesEntity}        parentPage  - Parent page entity
 * @param   {Map<number, string>} mastersById - Admin id → master name lookup
 * @returns {Promise<FeedCard[]>}             Promise that resolves to array of gallery card data
 */
async function fetchGalleryData(
  parentPage: IPagesEntity,
  mastersById: Map<number, string>,
): Promise<FeedCard[]> {
  const { pages: childPages } = await getChildPagesByParentUrl(
    parentPage.pageUrl,
  );
  const promises =
    childPages?.flatMap(extractPhotosFromPage(parentPage, mastersById)) || [];
  const resolved = await Promise.all(promises);
  return resolved.filter((c): c is FeedCard => c !== null);
}

type PhotoExtractor = (page: IPagesEntity) => Promise<FeedCard | null>[];

/**
 * Helper function to extract photos from a page entity.
 * @param   {IPagesEntity}        parentPage  - Parent page entity
 * @param   {Map<number, string>} mastersById - Admin id → master name lookup
 * @returns {PhotoExtractor}                  Per-page photo mapper
 */
function extractPhotosFromPage(
  parentPage: IPagesEntity,
  mastersById: Map<number, string>,
): PhotoExtractor {
  return (page: IPagesEntity) => {
    /** Extract master ID from page attribute values (used for the alt/name) */
    const masterIdArr = page.attributeValues?.master_id?.value as
      Array<{ value: number | string; title?: string }> | undefined;
    /**
     * Card name: the linked master's `master_name` (source of truth),
     * degrading to the link `title` snapshot when the admin is missing.
     */
    const masterLink = masterIdArr?.[0];
    const masterName =
      (masterLink?.value === undefined
        ? undefined
        : mastersById.get(Number(masterLink.value))) ||
      masterLink?.title ||
      '';
    /** Get photos array from page gallery photos attribute with fallback to empty array */
    const photos =
      (page?.attributeValues?.gallery_photos?.value as
        OneEntryImageFile[] | undefined) || [];
    /**
     * Open the Gallery page filtered to the tile's main category, like the
     * static-html home gallery (`onGalleryClick`). The gallery category
     * pageUrl carries a `gallery-` prefix (`gallery-hair` → `?category=HAIR`).
     */
    const categoryUrl = parentPage.pageUrl.replace(/^gallery-/, '');
    const link = categoryUrl
      ? `/gallery?category=${categoryUrl.toUpperCase()}`
      : '/gallery';
    /** Map through photos to create photo objects with preview data */
    return photos.map(async (photo) => {
      /** Normalize inconsistent `previewLink` shapes into plain URL strings */
      const { full, thumb, blur } = getGalleryImageUrls(photo);

      /** Return null if no image source is available */
      if (!thumb) return null;

      /**
       * Only the ready-made CMS blur — never generate one here. The home strip
       * ({@link GalleryGrid}) renders no placeholder, so generating an LQIP
       * would download every tile server-side and run it through sharp for a
       * value nothing reads.
       */
      const preview = blur;

      /** Return photo object with all required properties */
      return {
        name: masterName,
        link,
        img: full,
        thumb,
        preview,
        spec: parentPage.localizeInfos,
      };
    });
  };
}

export default GalleryFeed;
