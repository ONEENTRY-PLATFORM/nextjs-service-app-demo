import type { IMenusPages } from 'oneentry/dist/menus/menusInterfaces';

/**
 * Menu pages as an array, whatever shape the Menus API returned.
 *
 * `menu.pages` comes back as an array OR, when a menu holds a single item, as a
 * bare object. Consumers used to handle this in two wrong ways: a cast without a
 * runtime check (which crashes on `.map` for the object form) or
 * `Array.isArray(pages) ? pages : []`, which silently DROPS that single page and
 * renders an empty menu. Both are latent — the API happens to send arrays today,
 * even for the one-item `user_menu`.
 * @param   {unknown}       pages - `menu.pages` in either shape, or nothing
 * @returns {IMenusPages[]}       Array of pages; empty when there are none
 */
export const normalizeMenuPages = (pages: unknown): IMenusPages[] => {
  if (Array.isArray(pages)) {
    return pages as IMenusPages[];
  }
  return pages ? [pages as IMenusPages] : [];
};
