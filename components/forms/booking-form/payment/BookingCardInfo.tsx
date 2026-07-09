import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import AddressCard from '@/components/shared/AddressCard';
import StarsGroup from '@/components/shared/StarsGroup';

/**
 * BookingCardInfo component
 * @param   {object}      props         - salon, service, master
 * @param   {object}      props.salon   - salon
 * @param   {object}      props.service - service
 * @param   {object}      props.master  - master
 * @returns {JSX.Element}               - BookingCardInfo
 */
const BookingCardInfo = ({
  salon,
  service,
  master,
}: {
  salon: IPagesEntity | undefined;
  service: IPagesEntity | undefined;
  master: IAdminEntity | undefined;
}): JSX.Element => {
  /** Get master name from attribute values */
  const masterName = master?.attributeValues?.master_name?.value as
    string | undefined;

  /** Get service specification title */
  const spec = service?.localizeInfos?.title;

  /** Get master rating value */
  const rating = master?.attributeValues?.master_rating?.value as
    number | undefined;

  /** Get salon title with fallback to 'Any' */
  const salonTitle = salon?.localizeInfos?.title || 'Any';

  /** Get salon address with fallback to 'Any' */
  const salonAddress =
    (salon?.attributeValues?.salon_address?.value as string | undefined) ||
    'Any';

  /** Render booking information including master name, service spec, rating and salon details */
  return (
    <div className="mb-2.5 flex flex-col flex-wrap content-start">
      {/** Display master name */}
      <h2 className="mb-0.5 text-lg leading-4 text-neutral-600">
        {masterName}
      </h2>
      {/** Display service specification */}
      <div className="mb-1 text-xs font-bold text-fuchsia-500">
        {spec} master
      </div>
      {/** Display master rating */}
      <StarsGroup rating={rating ?? 0} size={16} />
      {/** Display salon title if available */}
      {salonTitle !== 'Any' && (
        <div className="mt-2 text-base">{salonTitle}</div>
      )}
      {/** Display salon address if available */}
      {salonAddress !== 'Any' && <AddressCard address={salonAddress} />}
      <hr className="relative mt-2 h-px w-full self-center text-fuchsia-300" />
    </div>
  );
};

export default BookingCardInfo;
