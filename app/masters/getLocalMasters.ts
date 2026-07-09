import {
  localMasterSectionsData,
  localSalonsData,
  salonFoldersData,
} from '@/components/data';
import type {
  MasterItem,
  MastersMainCategory,
  SalonOption,
} from '@/components/layout/masters-page/taxonomy';

/**
 * Local demo roster for the masters page — the 32 specialists from the
 * static-html mock (`MastersPage.tsx` → `SECTIONS`) with portraits from
 * `public/images/Beauty content/Specialist/<Salon>/<Name>.jpeg`.
 *
 * Temporary data source: masters are not created in the CMS yet (content
 * plan, stage 4 — 32 OneEntry admins with `master_*` attributes). Once they
 * exist, `app/masters/page.tsx` switches to the CMS list automatically and
 * this file becomes unused. Demo specialists carry no `href` — profile pages
 * exist only for CMS admins.
 *
 * The raw data lives in `components/data.js` (the shared mock-data file);
 * this module only types it and builds the normalized specialist list.
 */

/** Salon filter options — the three studios from the mock */
export const LOCAL_SALONS: SalonOption[] = localSalonsData;

/** Salon folder in `public/images/Beauty content/Specialist/` per salon id */
const SALON_FOLDER: Record<string, string> = salonFoldersData;

/**
 * Profession sections in the mock's order; each specialist is a
 * `[name, role base, salon id]` tuple — the rendered role line is
 * `<role base> · <salon folder>` as in the mock.
 */
const LOCAL_SECTIONS = localMasterSectionsData as {
  section: string;
  categories: MastersMainCategory[];
  masters: [string, string, string][];
}[];

/**
 * Build the demo specialist list from the section table above.
 * @returns {MasterItem[]} Flat specialist list in the mock's section order
 */
const getLocalMasters = (): MasterItem[] =>
  LOCAL_SECTIONS.flatMap(({ section, categories, masters }) =>
    masters.map(([name, roleBase, salonId]) => {
      const folder = SALON_FOLDER[salonId] ?? '';
      return {
        id: name,
        name,
        role: `${roleBase} · ${folder}`,
        section,
        categories,
        salonId,
        /** All mock specialists carry a 5-star rating (`DETAILS`) */
        rating: 5,
        photo: encodeURI(
          `/images/Beauty content/Specialist/${folder}/${name}.jpeg`,
        ),
      };
    }),
  );

export default getLocalMasters;
