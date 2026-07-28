import type { JSX, ReactNode } from 'react';

/**
 * OfferSummaryRow — one label/value line of the modal's summary panel (mock
 * `SummaryRow`). An accent colour highlights the package line.
 * @param   {object}      props          - Component properties
 * @param   {string}      props.label    - Row label
 * @param   {ReactNode}   props.value    - Row value
 * @param   {string}      [props.accent] - Value colour override (the package row)
 * @returns {JSX.Element}                Summary row
 */
const OfferSummaryRow = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: ReactNode;
  accent?: string | undefined;
}): JSX.Element => (
  <div className="flex items-baseline justify-between py-1">
    <span className="text-sm text-neutral-300">{label}</span>
    <span
      className="text-base font-semibold"
      style={{ color: accent ?? '#4c4d56' }}
    >
      {value}
    </span>
  </div>
);

export default OfferSummaryRow;
