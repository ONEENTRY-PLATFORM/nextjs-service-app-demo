import type { ILocalizeInfo } from 'oneentry/dist/base/utils';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import { getChildPagesByParentUrl } from '@/app/api';
import { getMastersList } from '@/app/api/utils/getMastersList';
import getLocalGalleryItems from '@/app/gallery/getLocalGalleryItems';
import masterNamesById from '@/app/gallery/masterNamesById';
import getLqipPreview from '@/components/hooks/getLqipPreview';
import { SUB_TO_MAIN } from '@/components/layout/gallery-page/taxonomy';
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

  /**
   * Fall back to the local photo library when the CMS gallery tree is not
   * populated yet (content plan, stage 5), so the home strip matches the
   * design instead of rendering empty.
   */
  const cards =
    galleryData.length > 0 ? galleryData : await getLocalGalleryFeed();
  /** Shuffle gallery data and take the mock's six-tile strip */
  const feedCards = shuffleArray(cards).slice(0, 6);

  /** Section heading; falls back to the mock's "Gallery" when the block is not filled */
  const title = block?.localizeInfos?.title || 'Gallery';

  /** Render gallery feed section with title and photo grid */
  return (
    <section className="flex w-full flex-col justify-center py-5">
      <div className="flex w-full flex-col">
        <SectionTitle title={title} delay={0.5} className="mb-6 md:mb-10" />
        {/** Render the static six-tile gallery grid (static-html mock) */}
        <GalleryGrid cards={feedCards} />
      </div>
    </section>
  );
};

/**
 * Build gallery feed cards from the local photo library
 * (`public/images/Beauty content/Gallery/`) — the demo fallback used while the
 * CMS gallery tree is empty. Each card links to the matching service category
 * (`/services/hair`), mirroring the static-html home GALLERY strip.
 * @returns {Promise<FeedCard[]>} Demo gallery cards
 */
async function getLocalGalleryFeed(): Promise<FeedCard[]> {
  const items = await getLocalGalleryItems();
  return items.map((item) => {
    const main = SUB_TO_MAIN[item.category];
    return {
      name: item.master,
      link: main ? `/services/${main.toLowerCase()}` : '/gallery',
      img: item.url,
      thumb: item.url,
      preview: null,
      spec: { title: item.title } as ILocalizeInfo,
    };
  });
}

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
     * Link to the matching service category, like the static-html home gallery.
     * The gallery category pageUrl mirrors the service pageUrl with a `gallery-`
     * prefix (`gallery-hair` → `/services/hair`).
     */
    const categoryUrl = parentPage.pageUrl.replace(/^gallery-/, '');
    const link = categoryUrl ? `/services/${categoryUrl}` : '';
    /** Map through photos to create photo objects with preview data */
    return photos.map(async (photo) => {
      /** Normalize inconsistent `previewLink` shapes into plain URL strings */
      const { full, thumb, blur } = getGalleryImageUrls(photo);

      /** Return null if no image source is available */
      if (!thumb) return null;

      /** Reuse the ready-made blur, else generate a low-quality preview */
      const preview = blur ?? (await getLqipPreview(thumb));

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
