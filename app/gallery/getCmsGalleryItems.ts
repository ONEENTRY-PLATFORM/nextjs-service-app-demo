import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';

import { getChildPagesByParentUrl } from '@/app/api';
import getLqipPreview from '@/components/hooks/getLqipPreview';
import type {
  GalleryItem,
  GalleryMainCategory,
} from '@/components/layout/gallery-page/taxonomy';
import { DISC_ROLE } from '@/components/layout/gallery-page/taxonomy';
import type { OneEntryImageFile } from '@/components/utils';
import { getGalleryImageUrls } from '@/components/utils';

/**
 * Gallery category `pageUrl` (`gallery-hair`) → main-category filter value.
 * The CMS gallery tree tags photos only at this main-category level (no
 * price-list subcategory), so `GalleryItem.category` is set to the main
 * category itself — see `SUB_TO_MAIN` main-category self-entries in the
 * taxonomy.
 */
const MAIN_BY_PAGEURL: Record<string, GalleryMainCategory> = {
  'gallery-hair': 'HAIR',
  'gallery-face': 'FACE',
  'gallery-body': 'BODY',
  'gallery-nails': 'NAILS',
};

/**
 * Specialist name of a photo page: the linked `master_id` (list attribute),
 * falling back to the `pageUrl` (`gp-sofia-marchetti-hair` → `Sofia Marchetti`)
 * when the link is missing.
 * @param   {IPagesEntity} page - Photo page entity
 * @returns {string}            Specialist display name
 */
const masterName = (page: IPagesEntity): string => {
  const linked = page.attributeValues?.master_id?.value as
    Array<{ title?: string }> | undefined;
  const fromLink = linked?.[0]?.title?.trim();
  if (fromLink) {
    return fromLink;
  }
  return page.pageUrl
    .replace(/^gp-/, '')
    .replace(/-(hair|face|body|nails)$/, '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Build the gallery item list from the OneEntry gallery tree: the `gallery`
 * page's category children (`gallery-hair` … `gallery-nails`), each holding
 * photo pages with a `gallery_photos` group and a `master_id` link.
 *
 * Returns an empty list when the CMS gallery is not populated so the page can
 * fall back to the local photo scan (`getLocalGalleryItems`). The CMS tags
 * photos at the main-category level only, so `category` is the main category,
 * `title` is the category label and `role` is derived from the category
 * (matching the local scanner's discipline-based role) — no per-photo service
 * name or salon exists in the CMS.
 * @returns {Promise<GalleryItem[]>} Flat, deterministically ordered photo list
 */
const getCmsGalleryItems = async (): Promise<GalleryItem[]> => {
  const { pages: categories } = await getChildPagesByParentUrl('gallery');
  if (!categories || categories.length === 0) {
    return [];
  }

  /** Photo pages of every category, fetched concurrently, order preserved */
  const groups = await Promise.all(
    categories.map(async (category) => ({
      category,
      photoPages:
        (await getChildPagesByParentUrl(category.pageUrl)).pages ?? [],
    })),
  );

  /**
   * Flatten photo pages into per-image rows, keeping the CMS blur preview
   * (`previewLink` base64 LQIP) when the image carries one.
   */
  type RawPhoto = {
    url: string;
    cmsBlur: string | null;
    category: GalleryMainCategory;
    title: string;
    master: string;
    role: string;
  };
  const raw: RawPhoto[] = [];
  for (const { category, photoPages } of groups) {
    const main = MAIN_BY_PAGEURL[category.pageUrl];
    if (!main) {
      continue;
    }
    const role = DISC_ROLE[main.toLowerCase()] ?? 'Specialist';
    const categoryLabel = category.localizeInfos?.title || main;

    for (const photoPage of photoPages) {
      const master = masterName(photoPage);
      const images =
        (photoPage.attributeValues?.gallery_photos?.value as
          OneEntryImageFile[] | undefined) ?? [];

      for (const image of images) {
        const { full, blur } = getGalleryImageUrls(image);
        if (!full) {
          continue;
        }
        raw.push({
          url: full,
          cmsBlur: blur,
          category: main,
          title: categoryLabel,
          master,
          role,
        });
      }
    }
  }

  /**
   * Attach a blur placeholder to every photo: use the CMS `previewLink` LQIP
   * when present, otherwise generate one. Generation is bounded to
   * `PREVIEW_CONCURRENCY` at a time so the whole gallery does not fire dozens
   * of image fetches at once (which timed out and cached empty). Each unique
   * URL is cached per revalidation window, so repeat renders are free.
   */
  const PREVIEW_CONCURRENCY = 8;
  const items: GalleryItem[] = [];
  for (let start = 0; start < raw.length; start += PREVIEW_CONCURRENCY) {
    const built = await Promise.all(
      raw.slice(start, start + PREVIEW_CONCURRENCY).map(async (photo, i) => ({
        id: `g${start + i + 1}`,
        url: photo.url,
        preview: photo.cmsBlur ?? (await getLqipPreview(photo.url)),
        category: photo.category,
        title: photo.title,
        master: photo.master,
        salon: '',
        role: photo.role,
      })),
    );
    items.push(...built);
  }

  return items;
};

export default getCmsGalleryItems;
