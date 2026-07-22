import type { BookingService } from './types';

/** Length assumed for a service the CMS carries no duration for. */
const DEFAULT_SERVICE_MINUTES = 60;

/**
 * Total length of an appointment in minutes — the sum of every chosen service's
 * duration. Reads the numeric `durationMinutes` rather than re-parsing the
 * display line `duration`, which is formatted for humans and would break the
 * moment that formatting changes. A service whose duration the CMS does not
 * carry counts as the standard 60-minute visit rather than as free time.
 * @param   {BookingService[]} services - Chosen services (may be empty)
 * @returns {number}                    Total minutes; `0` for an empty selection
 */
const totalServiceMinutes = (services: BookingService[]): number =>
  services.reduce(
    (sum, sv) => sum + (sv.durationMinutes ?? DEFAULT_SERVICE_MINUTES),
    0,
  );

export default totalServiceMinutes;
