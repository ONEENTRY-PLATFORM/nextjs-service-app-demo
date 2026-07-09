import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IOrderByMarkerEntity } from 'oneentry/dist/orders/ordersInterfaces';
import type { Dispatch, JSX, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

import { getPageById } from '@/app/api';
import { isError } from '@/app/api';
import AddressCard from '@/components/shared/AddressCard';

import CardAnimations from '../../animations/CardAnimations';
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

  /** Find the salon entity from order form data */
  const salonEntity = order.formData.find((el) => el.marker === 'order_salon');
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

  return (
    /** Animated card wrapper with border styling */
    <CardAnimations
      className="flex gap-5 rounded-2xl border border-solid border-fuchsia-500 px-4 py-3"
      index={index}
    >
      {/* Main content area */}
      <div className="flex w-[65%] grow flex-col text-base leading-8">
        {/* Salon information section */}
        <div>
          <h4 className="text-neutral-600">{salonTitle}</h4>
          <AddressCard address={salonAddress} />
        </div>

        {/* Product title section */}
        <OrderProductTitle order={order} />

        {/* Divider line */}
        <hr className="h-px w-full self-center border-none bg-fuchsia-500" />

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
