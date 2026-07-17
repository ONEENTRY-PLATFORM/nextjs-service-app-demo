import { MapPin } from 'lucide-react';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';
import type { Dispatch, JSX, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

import { getPageById } from '@/app/api';
import { isError } from '@/app/api';
import {
  ORDERS_STATUS_CANCELED,
  ORDERS_STATUS_COMPLETED,
} from '@/app/store/orderMarkers';

import CardAnimations from '../../animations/CardAnimations';
import StatusBadge from '../StatusBadge';
import OrderButtonsGroup from './components/OrderButtonsGroup';
import OrderDateTime from './components/OrderDateTime';
import OrderProductTitle from './components/OrderProductTitle';

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
 * @param   {object}                            props            - Component props
 * @param   {IAttributeValues}                  props.dict       - Dictionary containing localized strings
 * @param   {IOrderByMarkerEntity}              props.order      - Order entity containing order details
 * @param   {IAdminEntity}                      props.master     - Master entity associated with the order
 * @param   {Dispatch<SetStateAction<boolean>>} props.setRefetch - Function to trigger refetching of data
 * @param   {number}                            props.index      - Index of the card for animation purposes
 * @returns {JSX.Element}                                        JSX element representing the order card
 */
const OrderCard = ({
  dict,
  order,
  master,
  setRefetch,
  index,
}: {
  dict: IAttributeValues;
  order: IOrderByMarkerEntity;
  master: IAdminEntity;
  setRefetch: Dispatch<SetStateAction<boolean>>;
  index: number;
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
  const salonEntity = order.formData.find((el) => el.marker === 'salon');
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
      if (!result.isError && result.data) {
        /** Set salon address and title from the fetched data */
        setSalonAddress(
          (result.data.page?.attributeValues?.salon_address?.value as
            string | undefined) || '',
        );
        setSalonTitle(result.data.page?.localizeInfos?.title || '');
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
    <CardAnimations
      className="relative flex flex-col gap-3 rounded-2xl border border-slate-150 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
      index={index}
    >
      {/* Status badge — top-right for completed / cancelled orders */}
      {(statusIdentifier === ORDERS_STATUS_COMPLETED ||
        statusIdentifier === ORDERS_STATUS_CANCELED) && (
        <span className="absolute top-3 right-3 z-10">
          <StatusBadge status={statusIdentifier} />
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

        {/* Product title section */}
        <OrderProductTitle order={order} />

        {/* Date and time section */}
        <OrderDateTime order={order} />
      </div>

      {/* Buttons group for order actions */}
      <OrderButtonsGroup
        dict={dict}
        order={order}
        master={master}
        setRefetch={setRefetch}
      />
    </CardAnimations>
  );
};

export default OrderCard;
