import { Check, X } from 'lucide-react';
import type { JSX } from 'react';

import type { ORDERS_STATUS_CANCELED } from '@/app/store/orderMarkers';
import { ORDERS_STATUS_COMPLETED } from '@/app/store/orderMarkers';

/**
 * StatusBadge renders the small status pill shown in the top-right corner of a
 * completed or cancelled order card: a cyan pill with a check, or a muted one
 * with a cross.
 *
 * The label comes from the order's own `statusLocalizeInfos.title` — the status
 * names live in the admin panel and are renamable there, so hardcoding them
 * guarantees drift. It already had: the pill said "Cancelled" while the CMS
 * calls that status "Canceled". The marker still drives the STYLING (colour and
 * icon), which is a design decision rather than CMS data.
 * @param   {object}      props         - Component props
 * @param   {string}      props.status  - Order status identifier, one of the CMS status markers
 * @param   {string}      [props.title] - Localized status name from `statusLocalizeInfos`
 * @returns {JSX.Element}               Status pill element
 */
const StatusBadge = ({
  status,
  title,
}: {
  status: typeof ORDERS_STATUS_COMPLETED | typeof ORDERS_STATUS_CANCELED;
  title?: string | undefined;
}): JSX.Element => {
  const isCompleted = status === ORDERS_STATUS_COMPLETED;
  /** Fall back to the marker itself — never render an empty pill. */
  const label = title || status;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold"
      style={
        isCompleted
          ? { background: '#109AA918', color: '#109AA9' }
          : { background: '#f7f7fb', color: '#a8a9b5' }
      }
    >
      {isCompleted ? <Check size={9} /> : <X size={9} />}
      {label}
    </span>
  );
};

export default StatusBadge;
