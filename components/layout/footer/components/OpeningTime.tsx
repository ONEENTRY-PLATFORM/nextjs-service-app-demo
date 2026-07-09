import parse from 'html-react-parser';
import type { JSX, Key } from 'react';

/** A single opening-time row from the `opening_time` block attribute. */
export type OpeningTimeRow = { header: string; htmlValue: string };

/**
 * OpeningTime component to display opening hours (presentational).
 *
 * Two variants matching the static-html footer mock: `column` — the desktop
 * 4th column (day and hours as stacked lines), `row` — the mobile collapse
 * (day and hours justified in one row).
 * @param   {object}           props           - Component properties
 * @param   {OpeningTimeRow[]} props.rows      - Opening time rows from the CMS block
 * @param   {'column' | 'row'} [props.variant] - Layout variant (default `column`)
 * @returns {JSX.Element}                      JSX.Element representing the opening time rows
 */
const OpeningTime = ({
  rows,
  variant = 'column',
}: {
  rows: OpeningTimeRow[];
  variant?: 'column' | 'row';
}): JSX.Element => {
  if (variant === 'row') {
    return (
      <>
        {rows.map((time, i: Key) => (
          <div key={i} className="flex justify-between gap-8 text-sm">
            <span className="font-medium">{time.header}</span>
            <span className="opacity-90">
              {time.htmlValue && parse(time.htmlValue)}
            </span>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {rows.map((time, i: Key) => (
        <div key={i}>
          <p className="mb-2 text-sm opacity-90">{time.header}</p>
          <div className="mb-2 text-sm opacity-90">
            {time.htmlValue && parse(time.htmlValue)}
          </div>
        </div>
      ))}
    </>
  );
};

export default OpeningTime;
