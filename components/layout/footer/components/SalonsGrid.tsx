import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import { getChildPagesByParentUrl } from '@/app/api';
import Phone2Icon from '@/components/icons/phone-2';

/**
 * SalonsGrid component to display a grid of salon contact information.
 *
 * Renders one grid cell per salon (grid itself lives in MenuSection):
 * uppercase salon name, address and phone with a vertical divider between
 * columns, following the static-html footer mock.
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

  /** Render salon contact information as grid cells */
  return (
    <>
      {contactsData?.map((item, i: number) => {
        return (
          <div
            key={i}
            className={
              'min-w-0' +
              (i > 0
                ? ' border-t border-black/80 pt-4 sm:border-t-0 sm:border-l sm:border-black/80 sm:pt-0 sm:pl-4'
                : '')
            }
          >
            {/** Display salon title */}
            <h2 className="mb-3 text-sm font-bold tracking-wide uppercase sm:text-base">
              {item.title}
            </h2>
            {/** Display salon address and phone information */}
            <address className="not-italic">
              <p className="mb-2 text-sm opacity-90 sm:min-h-10 xl:min-h-0">
                {item.address}
              </p>
              <a
                href={'tel:' + item.phone}
                className="flex items-center gap-1.5 text-sm focus:outline-none"
              >
                <Phone2Icon />
                <p className="whitespace-nowrap">{item.phoneFormatted}</p>
              </a>
            </address>
          </div>
        );
      })}
    </>
  );
};

export default SalonsGrid;
