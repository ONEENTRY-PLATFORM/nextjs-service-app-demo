/**
 * Gallery taxonomy ported from the static-html mock
 * (`static-html/src/app/data/priceList.ts` + `GalleryPage.tsx`).
 *
 * Temporary local data source: while the gallery section of the CMS is not
 * populated (content plan, stage 5), gallery photos are read from
 * `public/images/Beauty content/Gallery/` and classified with these helpers.
 */

/** Main service category of the price list (top-level gallery filter) */
export type GalleryMainCategory = 'HAIR' | 'FACE' | 'BODY' | 'NAILS';

/** A single gallery work photo */
export type GalleryItem = {
  /** Stable id, e.g. `g12` */
  id: string;
  /** Public URL of the photo */
  url: string;
  /** Base64 LQIP blur placeholder shown while the photo loads, or `null` */
  preview: string | null;
  /** Price-list subcategory, e.g. `Coloring` */
  category: string;
  /** Service name decoded from the photo file name */
  title: string;
  /** Specialist name decoded from the folder name */
  master: string;
  /** Admin id of the linked master (CMS `master_id`), for the profile link */
  masterId?: number | undefined;
  /**
   * Salons the photo belongs to, via its master (a master may work in more
   * than one). CMS items carry salon `pageUrl` markers (`downtown`), the local
   * scan carries folder names (`Downtown`) — match case-insensitively. Empty
   * when the salon is unknown, in which case the photo is hidden from salon
   * pages.
   */
  salon: string[];
  /** Specialist role line, e.g. `Stylist · Downtown` */
  role: string;
};

/** Main category chips, in the mock's order */
export const GALLERY_MAIN_CATS: { id: GalleryMainCategory; label: string }[] = [
  { id: 'HAIR', label: 'Hair' },
  { id: 'FACE', label: 'Face' },
  { id: 'BODY', label: 'Body' },
  { id: 'NAILS', label: 'Nails' },
];

/** Price-list subcategories per main category (static-html `priceList.ts`) */
export const GALLERY_SUBCATEGORIES: Record<
  GalleryMainCategory,
  readonly string[]
> = {
  HAIR: ['Haircut', 'Coloring', 'Styling', 'Hair Care'],
  FACE: ['Facials', 'Aesthetic Treatments', 'Brows & Lashes', 'Makeup'],
  BODY: [
    'Massage',
    'Hammam & Rituals',
    'Body Wraps',
    'Waxing & Sugaring',
    'Henna Art',
  ],
  NAILS: ['Manicure', 'Pedicure'],
};

/** Subcategory → main category lookup, built from the table above */
export const SUB_TO_MAIN: Record<string, GalleryMainCategory> = {};
(
  Object.entries(GALLERY_SUBCATEGORIES) as [
    GalleryMainCategory,
    readonly string[],
  ][]
).forEach(([main, subs]) => {
  subs.forEach((sub) => {
    SUB_TO_MAIN[sub] = main;
  });
});
/**
 * The CMS gallery tags photos at the main-category level only (no price-list
 * subcategory), so CMS items carry the main category as their `category`.
 * Register each main category as its own key so main-category filtering works
 * for them just like it does for the local scanner's subcategories.
 */
GALLERY_MAIN_CATS.forEach(({ id }) => {
  SUB_TO_MAIN[id] = id;
});

/** Specialist role by primary discipline (folder-name suffix) */
export const DISC_ROLE: Record<string, string> = {
  hair: 'Stylist',
  nails: 'Nail Specialist',
  makeup: 'Makeup Specialist',
  face: 'Master Therapist',
  body: 'Master Therapist',
  henna: 'Henna Artist',
};
