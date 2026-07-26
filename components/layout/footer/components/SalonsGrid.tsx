import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import { getChildPagesByParentUrl } from '@/app/api/server/pages/getChildPagesByParentUrl';
import { formatUaePhone } from '@/components/utils/formatUaePhone';
import { salonFromPage } from '@/components/utils/salonFromPage';

import SalonCell from './SalonCell';

/**
 * SalonsGrid component to display a grid of salon contact information.
 *
 * Renders one grid cell per salon (grid itself lives in MenuSection):
 * on mobile each salon is a collapsible row, on `sm+` details are always
 * visible with vertical dividers between columns.
 * @returns {Promise<JSX.Element>} JSX.Element representing a grid of salon contact information
 */
const SalonsGrid = async (): Promise<JSX.Element> => {
  /** Fetch child pages for salons to display contact information */
  const { pages } = await getChildPagesByParentUrl('salons');

  /** Extract contact data from salon pages for display */
  const contactsData = pages?.map((page: IPagesEntity) => {
    const salon = salonFromPage(page);
    return {
      title: salon.name,
      address: salon.address,
      phone: salon.phone,
      phoneFormatted: formatUaePhone(salon.phone),
    };
  });

  /** Render salon contact information as grid cells */
  return (
    <>
      {contactsData?.map((item, i: number) => (
        <SalonCell
          key={i}
          index={i}
          title={item.title}
          address={item.address}
          phone={item.phone}
          phoneFormatted={item.phoneFormatted}
        />
      ))}
    </>
  );
};

export default SalonsGrid;
