import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';

import type { SalonPhoto } from '@/components/layout/salon-page/types';
import { getGalleryImageUrls } from '@/components/utils/getGalleryImageUrls';
import { imageFileList } from '@/components/utils/imageFileList';

/** Most photos the salon gallery shows (hero + thumbnails). */
const MAX_SALON_PHOTOS = 9;

/**
 * salonPhotosFromPage — the salon's own photos, read from its `salon_images`
 * (`groupOfImages`) attribute.
 *
 * These are pictures of the studio itself, deliberately separate from the work
 * gallery: the salon page used to borrow gallery photos tagged to the salon
 * through their master, which surfaced photos of *work* rather than the venue.
 * Each file carries the CMS `previewLink` LQIP, so no blur has to be generated.
 * An unset attribute comes back as the empty string, not `[]` — `imageFileList`
 * absorbs that, so an empty salon simply yields `[]` and the page degrades to
 * its "no photos yet" state.
 * @param   {IPagesEntity} page - Salon page from the CMS
 * @returns {SalonPhoto[]}      Salon photos with blur placeholders, capped
 */
export const salonPhotosFromPage = (page: IPagesEntity): SalonPhoto[] =>
  imageFileList(page.attributeValues?.salon_images?.value)
    .map((file) => {
      const { full, blur } = getGalleryImageUrls(file);
      return { url: full, preview: blur };
    })
    .filter((photo) => photo.url)
    .slice(0, MAX_SALON_PHOTOS);
