import { notFound } from 'next/navigation';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import { type JSX, memo } from 'react';

import { getAdminsInfo, getPageById } from '@/app/api';

import MasterAnimations from './animations/MasterAnimations';
import Master from './components/Master';
import MasterImage from './components/MasterImage';
import MasterSalons from './components/MasterSalons';
import Title from './components/Title';

/**
 * Master single page layout component
 *
 * This component displays detailed information about a specific master,
 * including their image, services, salons, and related portfolio items.
 * @param   {object}               props                    - Component properties
 * @param   {string}               props.handle             - Master identifier
 * @param   {object}               props.searchData         - Search parameters
 * @param   {string}               props.searchData.service - Service identifier
 * @returns {Promise<JSX.Element>}                          JSX.Element representing the master single page
 */
const MasterSingleLayout = async ({
  handle,
  searchData,
}: {
  handle: string;
  searchData: { service: string };
}): Promise<JSX.Element> => {
  /** Fetch admin information including masters data */
  const { admins } = await getAdminsInfo({ body: [], offset: 0, limit: 100 });
  /** Find the specific master by handle (ID) */
  const master = admins?.find(
    (admin: IAdminEntity) => admin.id === Number(handle),
  );

  /** if no data in searchParams get first master service id */
  const services = master?.attributeValues?.services?.value as
    Array<{ id: number }> | undefined;
  const sId = searchData?.service || services?.[0]?.id;

  /** Fetch service page data by service ID */
  const { page: service, isError } = await getPageById(sId as number);

  /** Return 404 page if master or service not found or error occurred */
  if (!master || !service || isError) {
    return notFound();
  }
  /** Destructure master attributes for easier access */
  const { master_name, master_image, master_salon } = master.attributeValues;

  /** Extract master image source URL */
  const imgArr = master_image?.value as
    Array<{ downloadLink?: string }> | undefined;
  const imageSrc = imgArr?.[0]?.downloadLink;
  /** Extract master name with fallback to empty string */
  const name = (master_name?.value as string | undefined) ?? '';

  /** Render master single page layout with master info and service */
  return (
    <section className="relative mx-auto box-border flex w-full max-w-360 shrink-0 flex-col">
      <div className="flex w-full flex-col justify-center bg-white px-5 py-20 max-md:max-w-full max-sm:py-10">
        {/** Display service title */}
        <Title title={service?.localizeInfos.title || ''} />
        <MasterAnimations className="flex w-full gap-20 max-lg:gap-10 max-md:flex-col">
          <div className="flex w-[30%] grow flex-col max-md:mt-10 max-md:w-full max-sm:mt-5">
            {/** Display master image */}
            <figure className="item mb-8 overflow-hidden rounded-3xl bg-slate-100 max-sm:h-64">
              <MasterImage imageSrc={imageSrc ?? ''} alt={name} />
            </figure>
            {/** Display master salons information */}
            <div className="item flex flex-wrap justify-between gap-2.5 px-4 text-xl leading-8 text-neutral-600">
              <MasterSalons
                salons={
                  master_salon as {
                    value: { title: string }[];
                  }
                }
              />
            </div>
          </div>
          {/** Display master detailed information */}
          <div className="flex w-[70%] flex-col max-md:w-full">
            <Master master={master} service={service} />
          </div>
        </MasterAnimations>
      </div>
    </section>
  );
};

export default memo(MasterSingleLayout);
