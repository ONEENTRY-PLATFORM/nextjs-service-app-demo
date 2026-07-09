import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import { ServerProvider } from '@/app/store/providers/ServerProvider';

import BookingButton from './BookingButton';
import MasterDescription from './MasterDescription';
import MasterInfo from './MasterInfo';
import MasterReviews from './MasterReviews';

/**
 * Master component to display detailed information about a master.
 * @param   {object}                   props         - Props for the Master component.
 * @param   {IAdminEntity}             props.master  - Master entity data.
 * @param   {IPagesEntity | undefined} props.service - Optional service information.
 * @returns {Promise<JSX.Element>}                   JSX.Element representing the Master component.
 */
const Master = async ({
  master,
  service,
}: {
  master: IAdminEntity;
  service?: IPagesEntity;
}): Promise<JSX.Element> => {
  /** Fetch dictionary data for localization */
  const [dict] = ServerProvider<IAttributeValues>('dict');

  /** Render master information, reviews, description and booking button */
  return (
    <div className="flex flex-col max-md:max-w-full">
      <div className="item mb-6 flex justify-between gap-0 max-lg:flex-wrap">
        {/* Display master information */}
        <MasterInfo master={master} service={service} />
        {/* Display reviews for the master */}
        <MasterReviews master={master} />
      </div>
      {/* Display master description */}
      <MasterDescription master={master} />
      {/* Button for booking a service with the master */}
      <BookingButton service={service} master={master} dict={dict} />
    </div>
  );
};

export default Master;
