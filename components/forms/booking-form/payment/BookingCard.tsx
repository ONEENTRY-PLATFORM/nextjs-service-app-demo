import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import useCartItem from '@/app/store/useCartItem';

import BookingCardDate from './BookingCardDate';
import BookingCardImage from './BookingCardImage';
import BookingCardInfo from './BookingCardInfo';
import TotalAmount from './TotalAmount';

/**
 * Booking card component.
 * @param   {object}           props      - Component props.
 * @param   {IAttributeValues} props.dict - Dictionary.
 * @returns {JSX.Element}                 JSX.Element.
 */
const BookingCard = ({ dict }: { dict: IAttributeValues }): JSX.Element => {
  /** Hydrate the active cart row's entities from the RTK Query cache */
  const { item, salon, service, master, product, date } = useCartItem();

  /** Early return if the cart row isn't initialised yet */
  if (!item) {
    return <></>;
  }

  /** Get localized service specification title */
  const spec = service?.localizeInfos?.title || '';

  /** Get localized product title */
  const productTitle = product?.localizeInfos?.title || '';

  return (
    <div className="flex w-full flex-col items-end self-stretch rounded-2xl border border-solid border-fuchsia-300 p-3.5">
      <div className="flex w-full justify-start gap-5 self-stretch">
        {/** Display master image if master data is available */}
        <div className="flex w-4/12 flex-col">
          {master && <BookingCardImage master={master} />}
        </div>
        {/** Display booking information and details */}
        <div className="flex w-8/12 flex-col">
          <BookingCardInfo salon={salon} service={service} master={master} />
          <div className="mb-1 text-base">
            {spec} - {productTitle}
          </div>
          <BookingCardDate date={date} />
          <TotalAmount dict={dict} />
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
