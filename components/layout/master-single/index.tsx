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

  /** Only a real master is required — 404 solely when the admin is missing. */
  if (!master) {
    return notFound();
  }

  /**
   * `master_services` is an `entity` list of service PRODUCTS:
   * `[{ value: { id: "p-<pageId>-<productId>", parentId: <subcategory page id> } }]`.
   * The heading is shown in the context of the linked subcategory page, so we
   * resolve it from `value.parentId` (a numeric page id) — falling back to a
   * numeric `?service=` param when present. The product `value.id` is a string
   * and is NOT a page id, so it must not be passed to `getPageById`.
   */
  const masterServices = master.attributeValues?.master_services?.value as
    Array<{ value?: { parentId?: number } }> | undefined;
  const searchService = Number(searchData?.service);
  const sId = Number.isFinite(searchService)
    ? searchService
    : masterServices?.[0]?.value?.parentId;

  /** Fetch the service (subcategory) page for the heading — optional. */
  const { page: service } =
    typeof sId === 'number' && Number.isFinite(sId)
      ? await getPageById(sId)
      : { page: undefined };
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
        {/** Service (subcategory) heading, falling back to the master name */}
        <Title title={service?.localizeInfos?.title || name} />
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
