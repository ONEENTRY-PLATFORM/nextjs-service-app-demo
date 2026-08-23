import { MapPin } from 'lucide-react';
import type {
  IAdminEntity,
  IAttributeValues,
  IOrderByMarkerEntity,
} from 'oneentry/types';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';

import { isError } from '@/app/api/api/api';
import { getPageById } from '@/app/api/server/pages/getPageById';
import { isOrderAwaitingPayment } from '@/app/api/utils/isOrderAwaitingPayment';
import {
  ORDER_FIELD_SALON,
  ORDERS_STATUS_CANCELED,
  ORDERS_STATUS_COMPLETED,
} from '@/app/store/orderMarkers';
import { salonFromPage } from '@/components/utils/salonFromPage';

import VisitCardAnimations from '../../animations/VisitCardAnimations';
import StatusBadge from '../StatusBadge';
import OrderButtonsGroup from './components/OrderButtonsGroup';
import OrderDateTime from './components/OrderDateTime';
import OrderServiceList from './components/OrderServiceList';
import OrderTotal from './components/OrderTotal';
import PayOrderButton from './components/PayOrderButton';

/**
 * Fetches salon data by ID
 * @param   {number}          salonId - ID of the salon to fetch
 * @returns {Promise<object>}         Promise resolving to either error or salon data
 */
async function fetchSalon(
  salonId: number,
): Promise<
  | { isError: true; data: unknown }
  | { isError: false; data: Awaited<ReturnType<typeof getPageById>> }
> {
  try {
    const data = await getPageById(salonId);
    if (isError(data)) {
      return { isError: true, data };
    }
    return { isError: false, data };
  } catch (e) {
    return { isError: true, data: e };
  }
}

/**
 * OrderCard component renders a card with order details including salon information,
 * product title, date/time and action buttons.
 * @param   {object}               props           - Component props
 * @param   {IAttributeValues}     props.dict      - Dictionary containing localized strings
 * @param   {IOrderByMarkerEntity} props.order     - Order entity containing order details
 * @param   {IAdminEntity}         props.master    - Master entity associated with the order
 * @param   {number}               props.index     - Index of the card for animation purposes
 * @param   {Map<number, number>}  props.durations - Product id → duration in minutes, for the service lines
 * @returns {JSX.Element}                          JSX element representing the order card
 */
const OrderCard = ({
  dict,
  order,
  master,
  index,
  durations,
}: {
  dict: IAttributeValues;
  order: IOrderByMarkerEntity;
  master: IAdminEntity;
  index: number;
  durations: Map<number, number>;
}): JSX.Element => {
  /** State for storing salon address and title */
  const [salonAddress, setSalonAddress] = useState<string>('');
  const [salonTitle, setSalonTitle] = useState<string>('');

  /**
   * Find the salon entity in the order's form data.
   *
   * `salon` is the marker the CMS `order` form actually declares. This used to
   * look for `order_salon` — the same guess the booking side wrote with, so both
   * halves were wrong together and the salon line rendered blank.
   */
  const salonEntity = order.formData.find(
    (el) => el.marker === ORDER_FIELD_SALON,
  );
  const salonId = (salonEntity?.value as number[] | undefined)?.[0];

  /** Load salon data when salon ID changes */
  useEffect(() => {
    /** Exit early if no salon ID is present */
    if (!salonId) return;

    /** Load salon data from API based on salon ID */
    const loadSalonData = async () => {
      /** Fetch salon data using the salon ID */
      const result = await fetchSalon(salonId);

      /** Process successful response */
      if (!result.isError && result.data?.page) {
        /** Set salon address and title from the fetched data */
        const salon = salonFromPage(result.data.page);
        setSalonAddress(salon.address);
        setSalonTitle(salon.name);
      } else {
        /** Log error if fetching fails */
        // eslint-disable-next-line no-console
        console.error('Failed to fetch salon data:', result.data);
      }
    };

    loadSalonData();
  }, [salonId]);

  /** Current order status, used to pick the status badge. */
  const { statusIdentifier } = order;

  return (
    /** Animated white panel matching the reference visit-row styling */
    <VisitCardAnimations
      className="relative flex flex-col gap-3 rounded-2xl border border-slate-150 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
      index={index}
    >
      {/* Status badge — top-right for completed / cancelled orders */}
      {(statusIdentifier === ORDERS_STATUS_COMPLETED ||
        statusIdentifier === ORDERS_STATUS_CANCELED) && (
        <span className="absolute top-3 right-3 z-10">
          <StatusBadge
            status={statusIdentifier}
            title={order.statusLocalizeInfos?.title}
          />
        </span>
      )}

      {/* Main content area */}
      <div className="flex flex-col gap-2">
        {/* Salon information section */}
        <h4 className="pr-24 text-xs font-bold tracking-wide text-slate-400 uppercase">
          {salonTitle}
        </h4>
        {salonAddress && (
          <div className="flex items-center gap-1">
            <MapPin size={15} color="#ed21f1" className="shrink-0" />
            <span className="text-sm text-neutral-300">{salonAddress}</span>
          </div>
        )}

        {/* Gradient divider */}
        <div
          className="h-px w-full"
          style={{ background: 'linear-gradient(90deg,#ed21f144,transparent)' }}
        />

        {/* Booked services, each with how long it takes */}
        <OrderServiceList order={order} durations={durations} />

        {/* Date and time section */}
        <OrderDateTime order={order} />

        {/* What the visit costs and how it is being paid for */}
        <OrderTotal order={order} />
      </div>

      <div className="flex w-full gap-2 text-base font-bold tracking-wide">
        {/* An online booking left unpaid can still be checked out from here */}
        {isOrderAwaitingPayment(order) && <PayOrderButton order={order} />}

        {/* Buttons group for order actions */}
        <OrderButtonsGroup dict={dict} order={order} master={master} />
      </div>
    </VisitCardAnimations>
  );
};

export default OrderCard;
