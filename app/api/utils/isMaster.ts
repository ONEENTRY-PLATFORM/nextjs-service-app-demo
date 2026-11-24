import type { IAdminEntity } from 'oneentry/types';

/**
 * isMaster — whether a CMS admin is a specialist shown on the site.
 *
 * The admins roster also holds plain CMS accounts (no master attributes at
 * all). The lists already skip them by `master_name`; the master route and the
 * sitemap must use the same rule, or each such account gets an empty
 * `/masters/<id>` page that is advertised to search engines.
 * @param   {IAdminEntity} admin - Admin from `getAdminsInfo`
 * @returns {boolean}            `true` when the admin has a non-empty `master_name`
 */
export const isMaster = (admin: IAdminEntity): boolean => {
  const name = admin.attributeValues?.master_name?.value;
  return typeof name === 'string' && name.trim() !== '';
};
