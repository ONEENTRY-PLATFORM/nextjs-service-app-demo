import type { JSX } from 'react';

/**
 * Stat — single metric pill in the summary grid.
 *
 * Renders the label + value as a small card. When `tooltip` is provided, the card
 * becomes a `group` and an absolutely-positioned popover appears on hover or focus,
 * explaining what the metric means. `tabIndex={0}` keeps the tooltip reachable from
 * the keyboard.
 * @param   {object}      props           - Component props.
 * @param   {string}      props.label     - Metric name (uppercased above the value).
 * @param   {string}      props.value     - Formatted metric value.
 * @param   {string}      [props.tone]    - Optional accent tone applied to the value text.
 * @param   {string}      [props.tooltip] - Plain-text explanation shown on hover/focus.
 * @returns {JSX.Element}                 JSX pill with label + value (+ optional hover tooltip).
 */
const Stat = ({
  label,
  value,
  tone,
  tooltip,
}: {
  label: string;
  value: string;
  tone?: string;
  tooltip?: string;
}): JSX.Element => (
  <div
    className="group relative rounded-card border border-paper/10 bg-white/5 px-3 py-2 outline-none focus-visible:border-paper/40"
    tabIndex={tooltip ? 0 : -1}
  >
    <div className="text-[10px] tracking-fine text-paper/50 uppercase">
      {label}
    </div>
    <div
      className={`mt-0.5 font-semibold tabular-nums ${tone ?? 'text-paper'}`}
    >
      {value}
    </div>
    {tooltip && (
      <div
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-card border border-paper/15 bg-black/95 px-3 py-2 text-[11px] leading-snug font-normal tracking-normal text-paper/90 opacity-0 shadow-lg transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        {tooltip}
      </div>
    )}
  </div>
);

export default Stat;
