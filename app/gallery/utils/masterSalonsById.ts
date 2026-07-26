import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';

import { entityPageIds } from '@/components/utils/entityLinks';

/**
 * Salon markers of every master admin keyed by admin id.
 *
 * The CMS has no salon link on gallery photo pages — a photo reaches its salon
 * through its master (`master_id` → admin → `master_salon`). `master_salon` is
 * an entity list pointing at salon *pages* by numeric id, so the salon children
 * of `salons` are needed to turn those ids into `pageUrl` markers (`downtown`).
 * A master may work in several salons, in which case all of them are returned
 * and the photo belongs to each.
 * @param   {IAdminEntity[] | undefined} admins     - Admin list from `getAdminsInfo`
 * @param   {IPagesEntity[] | undefined} salonPages - Child pages of `salons`
 * @returns {Map<number, string[]>}                 Admin id → salon `pageUrl` markers
 */
const masterSalonsById = (
  admins: IAdminEntity[] | undefined,
  salonPages: IPagesEntity[] | undefined,
): Map<number, string[]> => {
  /** Salon page id → `pageUrl`, so entity links resolve to route markers */
  const urlById = new Map<number, string>();
  for (const page of salonPages ?? []) {
    urlById.set(page.id, page.pageUrl);
  }

  const byId = new Map<number, string[]>();
  for (const admin of admins ?? []) {
    const markers: string[] = [];
    for (const id of entityPageIds(
      admin.attributeValues?.master_salon?.value,
    )) {
      const marker = urlById.get(id);
      if (marker && !markers.includes(marker)) {
        markers.push(marker);
      }
    }
    if (markers.length > 0) {
      byId.set(admin.id, markers);
    }
  }
  return byId;
};

export default masterSalonsById;
