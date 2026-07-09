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
  /** Price-list subcategory, e.g. `Coloring` */
  category: string;
  /** Service name decoded from the photo file name */
  title: string;
  /** Specialist name decoded from the folder name */
  master: string;
  /** Salon name: Downtown | Marina | JBR */
  salon: string;
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

/** Specialist role by primary discipline (folder-name suffix) */
export const DISC_ROLE: Record<string, string> = {
  hair: 'Stylist',
  nails: 'Nail Specialist',
  makeup: 'Makeup Specialist',
  face: 'Master Therapist',
  body: 'Master Therapist',
  henna: 'Henna Artist',
};

/**
 * Map a photo's service name (and folder disciplines) onto a price-list
 * subcategory — service-first, discipline as a fallback. Ported verbatim
 * from the mock's `classifySubcategory`.
 * @param   {string[]} disciplines - Disciplines from the folder name, e.g. `['face','makeup']`
 * @param   {string}   service     - Cleaned service name from the file name
 * @returns {string}               Price-list subcategory, e.g. `Manicure`
 */
export function classifySubcategory(
  disciplines: string[],
  service: string,
): string {
  const s = service.toLowerCase();
  if (/pedicure/.test(s)) return 'Pedicure';
  if (/manicure|nail art|gel polish/.test(s)) return 'Manicure';
  if (/henna/.test(s)) return 'Henna Art';
  if (/wrap/.test(s)) return 'Body Wraps';
  if (/wax|sugaring/.test(s)) return 'Waxing & Sugaring';
  if (/scrub|moroccan|hammam|turkish/.test(s)) return 'Hammam & Rituals';
  if (/massage|hot stone|lymphatic|cellulite|drainage/.test(s))
    return 'Massage';
  if (/brow|lash|lamination/.test(s)) return 'Brows & Lashes';
  if (/makeup/.test(s)) return 'Makeup';
  if (/hifu|rf lifting|microneedl|chemical peel|mesotherapy/.test(s))
    return 'Aesthetic Treatments';
  if (/facial|cleansing|hydrating|led/.test(s)) return 'Facials';
  if (/haircut|bang trim/.test(s)) return 'Haircut';
  if (/balayage|airtouch|global blonde|coloring|toner|highlight/.test(s))
    return 'Coloring';
  if (/keratin|treatment|hair spa/.test(s)) return 'Hair Care';
  if (/blowout|hairstyle|updo|curl|wave|styling/.test(s)) return 'Styling';
  /** Fallback by primary discipline */
  const d = new Set(disciplines);
  if (d.has('nails')) return 'Manicure';
  if (d.has('henna')) return 'Henna Art';
  if (d.has('body')) return 'Massage';
  if (d.has('makeup')) return 'Makeup';
  if (d.has('face')) return 'Facials';
  return 'Styling';
}
