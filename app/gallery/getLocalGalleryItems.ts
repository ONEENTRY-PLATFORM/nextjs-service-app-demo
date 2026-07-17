import { readdir } from 'node:fs/promises';
import path from 'node:path';

import type { GalleryItem } from '@/components/layout/gallery-page/taxonomy';
import {
  classifySubcategory,
  DISC_ROLE,
} from '@/components/layout/gallery-page/taxonomy';

/** Image extensions the scanner accepts */
const IMG_EXT = /\.(jpeg|jpg|png)$/i;

/**
 * Decode a service name from a photo file name: strip the extension, a
 * trailing counter (`_1`, ` 2`) and underscores.
 * @param   {string} fileName - Photo file name, e.g. `Gel Manicure_2.jpeg`
 * @returns {string}          Cleaned service name, e.g. `Gel Manicure`
 */
const cleanService = (fileName: string): string =>
  fileName
    .replace(IMG_EXT, '')
    .replace(/[_\s]*\d+$/, '')
    .replace(/_+$/, '')
    .replace(/_+/g, ' ')
    .trim();

/**
 * Read directory entries, returning an empty list when the directory is
 * missing — the gallery page must degrade, not crash.
 * @param   {string}                         dir - Absolute directory path
 * @returns {Promise<import('fs').Dirent[]>}     Directory entries or `[]`
 */
const safeReadDir = async (dir: string) => {
  try {
    return await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
};

/**
 * Build the gallery item list by scanning the local photo library.
 *
 * Temporary data source: the CMS gallery tree (children of the `gallery`
 * page) is not populated yet (content plan, stage 5). The folder/file names
 * encode salon, master, disciplines and service — exactly like the
 * static-html mock derives its `CONTENT_GALLERY`. Once the CMS holds gallery
 * categories and photo pages, this scanner should be replaced with
 * `getChildPagesByParentUrl`-based fetching.
 * @returns {Promise<GalleryItem[]>} Flat, deterministically ordered photo list
 */
const getLocalGalleryItems = async (): Promise<GalleryItem[]> => {
  /**
   * Photo library root. Folder layout (same convention as the static-html
   * mock's `beautyContent.ts`):
   * `Gallery/<Salon>/<Master>_<disciplines>/<Service>_<n>.<ext>`
   *
   * The segments are inlined literals ON PURPOSE — do not hoist them back into
   * a `const SEGMENTS = [...]` and spread it. Turbopack's static analyzer cannot
   * fold a spread const array, so `path.join(process.cwd(), ...SEGMENTS)` left
   * the root unknown and it fell back to tracing the WHOLE project into this
   * route's file trace: 1535 files / ~1.1 GB, including `static-html.zip`
   * (617 MB) and all of `public/`. With literals it resolves the path and traces
   * only what is really read.
   */
  const root = path.join(
    process.cwd(),
    'public',
    'images',
    'Beauty content',
    'Gallery',
  );
  const items: GalleryItem[] = [];
  /** First-seen role per master — mirrors the mock's `MASTER_ROLES` */
  const roles: Record<string, string> = {};

  const salons = (await safeReadDir(root))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const salon of salons) {
    const folders = (await safeReadDir(path.join(root, salon)))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    for (const folder of folders) {
      /** `<Master>_<disciplines>` — split on the first underscore only */
      const underscore = folder.indexOf('_');
      const master = (underscore >= 0 ? folder.slice(0, underscore) : folder)
        .normalize('NFC')
        .trim();
      const disciplines = (underscore >= 0 ? folder.slice(underscore + 1) : '')
        .split(/[-\s]+/)
        .map((disc) => disc.toLowerCase())
        .filter(Boolean);

      const knownRole = roles[master];
      const role =
        knownRole ??
        `${DISC_ROLE[disciplines[0] ?? 'hair'] ?? 'Specialist'} · ${salon}`;
      if (!knownRole) {
        roles[master] = role;
      }

      const files = (await safeReadDir(path.join(root, salon, folder)))
        .filter((entry) => entry.isFile() && IMG_EXT.test(entry.name))
        .map((entry) => entry.name)
        .sort();

      for (const file of files) {
        const title = cleanService(file);
        items.push({
          id: `g${items.length + 1}`,
          url: encodeURI(
            `/images/Beauty content/Gallery/${salon}/${folder}/${file}`,
          ),
          /** Local files are served straight from `public/` — no LQIP blur */
          preview: null,
          category: classifySubcategory(disciplines, title),
          title,
          master,
          salon,
          role,
        });
      }
    }
  }

  return items;
};

export default getLocalGalleryItems;
