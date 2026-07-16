import { Check, X } from 'lucide-react';
import type { JSX } from 'react';

import type { ORDERS_STATUS_CANCELED } from '@/app/store/orderMarkers';
import { ORDERS_STATUS_COMPLETED } from '@/app/store/orderMarkers';

/**
 * StatusBadge renders the small status pill shown in the top-right corner of a
 * completed or cancelled order card: a cyan "Completed" pill with a check, or a
 * muted "Cancelled" pill with a cross.
 * @param   {object}      props        - Component props
 * @param   {string}      props.status - Order status identifier, one of the CMS status markers
 * @returns {JSX.Element}              Status pill element
 */
const StatusBadge = ({
  status,
}: {
  status: typeof ORDERS_STATUS_COMPLETED | typeof ORDERS_STATUS_CANCELED;
}): JSX.Element => {
  const isCompleted = status === ORDERS_STATUS_COMPLETED;

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
      {isCompleted ? 'Completed' : 'Cancelled'}
    </span>
  );
};

export default StatusBadge;
