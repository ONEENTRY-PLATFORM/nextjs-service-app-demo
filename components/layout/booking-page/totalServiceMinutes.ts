import type { BookingService } from './types';

/**
 * Total length of an appointment in minutes — the sum of every chosen service's
 * duration. `BookingService.duration` is a human line (`"60 min"`), so it is
 * parsed here; a service whose duration the CMS does not carry counts as the
 * standard 60-minute visit rather than as free time.
 * @param   {BookingService[]} services - Chosen services (may be empty)
 * @returns {number}                    Total minutes; `0` for an empty selection
 */
const totalServiceMinutes = (services: BookingService[]): number =>
  services.reduce(
    (sum, sv) => sum + (Number.parseInt(sv.duration, 10) || 60),
    0,
  );

export default totalServiceMinutes;
