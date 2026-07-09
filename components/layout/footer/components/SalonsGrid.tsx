import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import { getChildPagesByParentUrl } from '@/app/api';
import Phone2Icon from '@/components/icons/phone-2';

/**
 * SalonsGrid component to display a grid of salon contact information.
 *
 * This component fetches salon data from the API and displays each salon's
 * title, address, and phone number in a grid layout. It includes phone icons
 * and properly formatted phone links for direct calling.
 * @returns {Promise<JSX.Element>} JSX.Element representing a grid of salon contact information
 */
const SalonsGrid = async (): Promise<JSX.Element> => {
  /** Fetch child pages for salons to display contact information */
  const { pages } = await getChildPagesByParentUrl('salons');

  /** Extract contact data from salon pages for display */
  const contactsData = pages?.map((page: IPagesEntity) => {
    return {
      title: page.localizeInfos?.title ?? '',
      address: (page.attributeValues?.salon_address?.value as string) ?? '',
      phone: (page.attributeValues?.salon_phone?.value as string) ?? '',
      phoneFormatted:
        (page.attributeValues?.salon_phone_formatted?.value as string) ?? '',
    };
  });

  /** Render salon contact information in a grid layout */
  return (
    <>
      {contactsData?.map((item, i: number) => {
        return (
          <div key={i} className="flex">
            <div className="flex flex-col">
              {/** Display salon title */}
              <h2 className="mb-5 text-base tracking-wide uppercase max-sm:mb-3">
                {item.title}
              </h2>
              {/** Display salon address and phone information */}
              <address className="not-italic">
                <p className="mb-1.5 text-sm">{item.address}</p>
                <a
                  href={'tel:' + item.phone}
                  className="flex gap-2 text-sm font-bold focus:outline-none"
                >
                  <Phone2Icon />
                  <p>{item.phoneFormatted}</p>
                </a>
              </address>
            </div>
            {/** Render divider between salon entries except for the last one */}
            {contactsData.length - 1 > i && (
              <div className="relative ml-4 box-border flex h-[110%] w-px shrink-0 flex-col self-stretch bg-black max-md:flex max-sm:hidden"></div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default SalonsGrid;
