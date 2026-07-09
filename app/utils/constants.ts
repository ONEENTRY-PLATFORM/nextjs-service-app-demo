/**
 * OneEntry page markers (`pageUrl`) used by this salon project.
 *
 * Used as arguments to `getPageByUrl` / `getChildPagesByParentUrl` / `getBlocksByPageUrl` / `getProductsByPageUrl`,
 * and to match `page.pageUrl` values returned by Menus API (see navigation dispatchers).
 */
export const PAGES = {
  home: 'home',
  services: 'services',
  masters: 'masters',
  gallery: 'gallery',
  contacts: 'contacts',
  booking: 'booking',
  salons: 'salons',
  profile: 'profile',
  notFound: '404',
} as const;

/** OneEntry menu markers — used by `getMenuByMarker`. */
export const MENUS = {
  main: 'main',
  userMenu: 'user_menu',
  bottomWeb: 'bottom_web',
  footerServices: 'services',
  footerAboutUs: 'about_us',
} as const;
