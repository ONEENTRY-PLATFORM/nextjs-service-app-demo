import type { JSX, ReactNode } from 'react';

import { DARK, MUTED, PINK } from '../constants';

/**
 * SummaryRow — one line of the booking summary (mock `SummaryRow`): a pink
 * icon square, an uppercase label, the value and an optional sub-line.
 * @param   {object}      props       - Component properties
 * @param   {ReactNode}   props.icon  - Row icon
 * @param   {string}      props.label - Uppercase label
 * @param   {ReactNode}   props.value - Main value
 * @param   {ReactNode}   [props.sub] - Optional sub-line
 * @returns {JSX.Element}             Summary row
 */
const SummaryRow = ({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}): JSX.Element => (
  <div className="flex items-start gap-3">
    <div
      className="mt-0.5 flex size-7 flex-shrink-0 items-center justify-center rounded-lg"
      style={{ background: `${PINK}15`, color: PINK }}
    >
      {icon}
    </div>
    <div>
      <p className="text-xs tracking-wide uppercase" style={{ color: MUTED }}>
        {label}
      </p>
      <p className="text-base font-semibold" style={{ color: DARK }}>
        {value}
      </p>
      {sub && (
        <p className="text-sm" style={{ color: MUTED }}>
          {sub}
        </p>
      )}
    </div>
  </div>
);

export default SummaryRow;
