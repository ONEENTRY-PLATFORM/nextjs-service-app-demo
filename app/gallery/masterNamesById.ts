import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';

/**
 * `master_name` of every master admin keyed by admin id, for resolving the
 * `master_id` link of gallery photo pages. Admins without `master_name` are
 * not masters and are skipped.
 * @param   {IAdminEntity[] | undefined} admins - Admin list from `getAdminsInfo`
 * @returns {Map<number, string>}               Admin id → master display name
 */
const masterNamesById = (
  admins: IAdminEntity[] | undefined,
): Map<number, string> => {
  const byId = new Map<number, string>();
  for (const admin of admins ?? []) {
    const name = (
      admin.attributeValues?.master_name?.value as string | undefined
    )?.trim();
    if (name) {
      byId.set(admin.id, name);
    }
  }
  return byId;
};

export default masterNamesById;
