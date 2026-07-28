import type { BookingMaster } from '../types';

/**
 * masterMatchesSelection — whether a specialist can serve the current
 * selection: works at the chosen salon and performs AT LEAST ONE of the
 * chosen services. The single source of the rule shared by the booking
 * wizard's roster filter and the offer booking modal — the two surfaces must
 * agree on who can perform an offer, or the modal would propose a specialist
 * the wizard's fallback then filters out.
 *
 * Empty CMS link arrays mean "no restriction": a specialist with no
 * `master_salon` serves every salon, one with no `master_services` performs
 * everything. `salonId: null` means no salon is chosen yet.
 * @param   {BookingMaster} master     - Specialist to test
 * @param   {number | null} salonId    - Chosen salon page id (`null` = any)
 * @param   {string[]}      serviceIds - Chosen service ids (wizard `BookingService.id` strings)
 * @returns {boolean}                  Whether the specialist matches
 */
const masterMatchesSelection = (
  master: BookingMaster,
  salonId: number | null,
  serviceIds: string[],
): boolean => {
  if (
    salonId !== null &&
    master.salonIds.length > 0 &&
    !master.salonIds.includes(salonId)
  ) {
    return false;
  }
  if (
    serviceIds.length > 0 &&
    master.serviceIds.length > 0 &&
    !serviceIds.some((id) => master.serviceIds.includes(id))
  ) {
    return false;
  }
  return true;
};

export default masterMatchesSelection;
