import type { JSX } from 'react';

import type { OpeningHoursRow } from '@/components/utils/parseOpeningTime';

/**
 * OpeningTime component to display opening hours (presentational).
 *
 * Two variants matching the static-html footer mock: `column` — the desktop
 * 4th column (day and hours as stacked lines), `row` — the mobile collapse
 * (day and hours justified in one row).
 * @param   {object}            props           - Component properties
 * @param   {OpeningHoursRow[]} props.rows      - Weekday rows parsed from the `opening_time` block
 * @param   {'column' | 'row'}  [props.variant] - Layout variant (default `column`)
 * @returns {JSX.Element}                       JSX.Element representing the opening time rows
 */
const OpeningTime = ({
  rows,
  variant = 'column',
}: {
  rows: OpeningHoursRow[];
  variant?: 'column' | 'row';
}): JSX.Element => {
  if (variant === 'row') {
    return (
      <>
        {rows.map((row) => (
          <div key={row.day} className="flex justify-between gap-8 text-sm">
            <span className="font-medium">{row.day}</span>
            <span className="opacity-90">{row.hours}</span>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {rows.map((row) => (
        <div key={row.day}>
          <p className="mb-2 text-sm opacity-90">{row.day}</p>
          <div className="mb-2 text-sm opacity-90">{row.hours}</div>
        </div>
      ))}
    </>
  );
};

export default OpeningTime;
