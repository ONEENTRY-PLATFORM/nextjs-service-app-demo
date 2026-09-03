import type { IAttributeValues } from 'oneentry/types';

import { dictText } from '@/components/utils/dictText';

/**
 * openingHoursValue — the one-line opening hours the compact cards render.
 *
 * The CMS `opening_time` block is the source: `summarizeOpeningHours` collapses
 * a uniform week into one range, which this renders as `Daily 10:00–22:00`. The
 * dictionary line stays the fallback for the two cases the summary cannot cover
 * — a week whose days differ, and a project with no `opening_time` block yet.
 * @param   {string | null | undefined}    hours - Collapsed week hours (`summarizeOpeningHours(...)?.hours`)
 * @param   {IAttributeValues | undefined} dict  - System-content dictionary
 * @returns {string}                             Display line, e.g. `Daily 10:00–22:00`
 */
export const openingHoursValue = (
  hours: string | null | undefined,
  dict: IAttributeValues | undefined,
): string =>
  hours
    ? `${dictText(dict, 'stat_daily_text', 'Daily')} ${hours}`
    : dictText(dict, 'salon_hours_value', 'Daily 10:00–22:00');
