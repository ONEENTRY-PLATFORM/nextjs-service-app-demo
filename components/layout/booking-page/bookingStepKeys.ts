import { ANY_MASTER, FLOWS } from './constants';
import type {
  BookingFlow,
  BookingMaster,
  BookingSalon,
  StepKey,
} from './types';

/**
 * bookingStepKeys — the step order of the chosen flow. It is dynamic:
 * specialist-first adds a Salon step only when the chosen specialist works at
 * multiple studios (or "Any specialist" was picked — the studio is then the
 * client's choice), and salon-first drops the Service step when the service was
 * preselected upstream.
 * @param   {object}             input               - Wizard selection the order depends on
 * @param   {BookingFlow | null} input.flow          - Chosen flow, `null` on the entry screen
 * @param   {boolean}            input.serviceLocked - The service was preselected upstream
 * @param   {string}             input.master        - Chosen specialist id (`''`, id or `__any__`)
 * @param   {BookingMaster[]}    input.masters       - All specialists
 * @param   {BookingSalon[]}     input.salons        - All salons
 * @returns {StepKey[]}                              Step keys in order (`[]` on the entry screen)
 */
const bookingStepKeys = ({
  flow,
  serviceLocked,
  master,
  masters,
  salons,
}: {
  flow: BookingFlow | null;
  serviceLocked: boolean;
  master: string;
  masters: BookingMaster[];
  salons: BookingSalon[];
}): StepKey[] => {
  if (!flow) return [];
  if (flow === 'salon-first') {
    return serviceLocked
      ? ['salon', 'specialist', 'datetime']
      : FLOWS['salon-first'];
  }
  const m = masters.find((x) => x.id === master);
  const salonCount =
    master === ANY_MASTER
      ? salons.length
      : (m?.salonIds.length ?? 0) || salons.length;
  return salonCount > 1
    ? ['specialist', 'salon', 'service', 'datetime']
    : ['specialist', 'service', 'datetime'];
};

export default bookingStepKeys;
