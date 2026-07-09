import dynamic from 'next/dynamic';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import { getAdminsInfo, getChildPagesByParentUrl } from '@/app/api';

const Salons = dynamic(() => import('./booking-form/Salons'), {
  ssr: true,
});

const Services = dynamic(() => import('./booking-form/Services'), {
  ssr: true,
});

const Products = dynamic(() => import('./booking-form/Products'), {
  ssr: true,
});

const Masters = dynamic(() => import('./booking-form/Masters'), {
  ssr: true,
});

const Calendar = dynamic(() => import('./booking-form/Calendar'), {
  ssr: true,
});

const SignIn = dynamic(() => import('./booking-form/SignIn'), {
  ssr: true,
});

const Payment = dynamic(() => import('./booking-form/Payment'), {
  ssr: true,
});

/**
 * BookingForm component renders the complete booking flow for salon services.
 *
 * This component orchestrates the entire booking process by loading necessary data
 * and rendering all the steps in sequence:
 * 1. Salon selection
 * 2. Service selection
 * 3. Product selection
 * 4. Master selection
 * 5. Calendar/date selection
 * 6. Sign-in
 * 7. Payment
 *
 * It fetches data for salons, services, and masters from the API and passes it
 * to the respective sub-components. All sub-components are loaded dynamically
 * with server-side rendering enabled for better performance.
 * @param   {object}               props      - Component properties
 * @param   {IAttributeValues}     props.dict - Dictionary containing localized strings for form labels and messages
 * @returns {Promise<JSX.Element>}            JSX.Element containing all booking steps wrapped in a fragment
 */
const BookingForm = async ({
  dict,
}: {
  dict: IAttributeValues;
}): Promise<JSX.Element> => {
  /** get salons */
  const { pages: salons } = await getChildPagesByParentUrl('salons');
  /** get services */
  const { pages: services } = await getChildPagesByParentUrl('services');
  /** get masters */
  const { admins } = await getAdminsInfo({ body: [], offset: 0, limit: 100 });
  /** filter masters */
  const masters = admins?.filter(
    (master: IAdminEntity) => master.attributeValues?.master_name && master,
  );

  return (
    <>
      <Salons dict={dict} salons={salons as IPagesEntity[]} />
      <Services
        dict={dict}
        services={services as IPagesEntity[]}
        salons={salons as IPagesEntity[]}
      />
      <Products dict={dict} salons={salons as IPagesEntity[]} />
      <Masters dict={dict} masters={masters as IAdminEntity[]} />
      <Calendar dict={dict} />
      <SignIn dict={dict} />
      <Payment dict={dict} />
    </>
  );
};

export default BookingForm;
