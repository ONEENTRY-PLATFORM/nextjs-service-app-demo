'use client';

import { useMemo } from 'react';

import { FALLBACK_CLOSE_MINUTES } from '../constants';
import type { BookingMaster, BookingSalon, BookingService } from '../types';
import dayCloseMinutes from '../utils/dayCloseMinutes';
import daySlots from '../utils/daySlots';
import totalServiceMinutes from '../utils/totalServiceMinutes';

/** What the Date & Time step needs to know to draw its grid. */
export interface BookingScheduleInput {
  /** Resolved chosen specialist (`undefined` for "Any specialist") */
  masterObj: BookingMaster | undefined;
  /** Resolved chosen salon */
  salonObj: BookingSalon | undefined;
  /** Resolved chosen services */
  serviceObjs: BookingService[];
  /** Chosen date (ISO day), `''` when none */
  date: string;
}

/** The bookable slots of the chosen day and the limits that bound them. */
export interface BookingScheduleState {
  /** Booking slots (`HH:MM`) for the chosen day, from the schedule; `[]` if none */
  slots: string[];
  /** Whether a CMS schedule drives the slots (else the step falls back to the static grid) */
  hasSchedule: boolean;
  /** Total length of the chosen services in minutes (`0` when none are chosen) */
  durationMinutes: number;
  /** Closing time of the chosen day, minutes since midnight; `null` when unknown */
  closeMinutes: number | null;
}

/**
 * useBookingSchedule — resolves the slot source for the Date & Time step: the
 * chosen specialist's `master_schedule`, or — for "Any specialist" / before one
 * is picked — the chosen salon's `salon_time`. `hasSchedule` distinguishes "no
 * schedule in the CMS" (fall back to the static grid) from "open that day has
 * no slots" (show none), which an empty `slots` alone cannot.
 *
 * It also reports how long the visit runs and when the studio shuts — together
 * they cut the tail off the time grid: a 90-minute visit cannot start an hour
 * before closing. Without a CMS schedule the static grid stands in, so its own
 * closing time does too.
 * @param   {BookingScheduleInput} input - Chosen specialist, salon, services and day
 * @returns {BookingScheduleState}       Slots of the day and the limits bounding them
 */
export const useBookingSchedule = ({
  masterObj,
  salonObj,
  serviceObjs,
  date,
}: BookingScheduleInput): BookingScheduleState => {
  const daySchedule = masterObj?.schedule ?? salonObj?.schedule;
  const hasSchedule = Boolean(daySchedule);

  const slots = useMemo(
    () => (date && daySchedule ? daySlots(daySchedule, date) : []),
    [date, daySchedule],
  );

  const durationMinutes = useMemo(
    () => totalServiceMinutes(serviceObjs),
    [serviceObjs],
  );

  const closeMinutes = useMemo(
    () =>
      hasSchedule
        ? date
          ? dayCloseMinutes(daySchedule, date)
          : null
        : FALLBACK_CLOSE_MINUTES,
    [hasSchedule, daySchedule, date],
  );

  return { slots, hasSchedule, durationMinutes, closeMinutes };
};
