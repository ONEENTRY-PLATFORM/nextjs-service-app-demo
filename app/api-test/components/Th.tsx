import type { JSX, ReactNode } from 'react';

/**
 * Th — table header cell with an optional hover/focus tooltip.
 *
 * Wraps the cell content in a `group` span and renders a popover *below* the header
 * (the table sits low in the page, so `top-full` keeps the tooltip on-screen). When
 * `tooltip` is provided the cell text gets a dotted underline + `cursor-help` to
 * signal interactivity. `tabIndex={0}` keeps the tooltip reachable from the keyboard.
 * @param   {object}           props           - Component props.
 * @param   {ReactNode}        props.children  - Header label content.
 * @param   {('left'|'right')} [props.align]   - Text alignment inside the `<th>` (default left).
 * @param   {string}           [props.tooltip] - Plain-text explanation shown on hover/focus.
 * @returns {JSX.Element}                      JSX `<th>` cell.
 */
const Th = ({
  children,
  align,
  tooltip,
}: {
  children: ReactNode;
  align?: 'left' | 'right';
  tooltip?: string;
}): JSX.Element => (
  <th
    className={`px-2 py-1 font-normal ${align === 'right' ? 'text-right' : ''}`}
  >
    {tooltip ? (
      <span
        className="group relative inline-flex cursor-help items-center gap-1 underline decoration-paper/30 decoration-dotted underline-offset-2 outline-none focus-visible:decoration-paper/70"
        tabIndex={0}
      >
        {children}
        <span
          role="tooltip"
          className={`pointer-events-none invisible absolute top-full z-20 mt-2 w-56 rounded-card border border-paper/15 bg-black/95 px-3 py-2 text-[11px] leading-snug font-normal tracking-normal text-paper/90 normal-case opacity-0 shadow-lg transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {tooltip}
        </span>
      </span>
    ) : (
      children
    )}
  </th>
);

export default Th;
