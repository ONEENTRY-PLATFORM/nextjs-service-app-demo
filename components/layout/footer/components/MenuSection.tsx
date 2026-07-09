import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import Copyrights from './Copyrights';
import OpeningTime from './OpeningTime';
import SalonsGrid from './SalonsGrid';
import SocialButtons from './SocialButtons';
import VerticalMenu from './VerticalMenu';

/**
 * MenuSection component to render the main content of the footer.
 *
 * Layout follows the static-html mock: a 4-column grid with the three salons
 * and opening time on the first row, a divider, then Services / About us
 * menus with the social links, and the copyright line at the bottom.
 * @param   {object}           props      - Component properties
 * @param   {IAttributeValues} props.dict - Dictionary object containing localized text values from OneEntry CMS
 * @returns {JSX.Element}                 JSX.Element representing the footer menu section with all its components
 */
const MenuSection = ({ dict }: { dict: IAttributeValues }): JSX.Element => {
  const { opening_time_text, follow_us_text } = dict;

  return (
    <div className="mx-auto w-full max-w-7xl px-3 pt-6 pb-6 text-black md:px-8 md:pt-12">
      {/* Salons + Opening Time */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3 xl:grid-cols-[1fr_1fr_1fr_9rem]">
        <SalonsGrid />

        {/* Opening Time — 4th column on desktop */}
        <div className="min-w-0 xl:border-l xl:border-black/80 xl:pl-4">
          <p className="mb-3 text-sm font-bold tracking-wide uppercase">
            {(opening_time_text?.value as string | undefined) ?? 'Opening Time'}
          </p>
          <div className="flex flex-col gap-2 text-sm opacity-90">
            <OpeningTime />
          </div>
        </div>
      </div>

      {/* Divider under the salons */}
      <div className="mt-6 h-px bg-black/80" />

      {/* Services | About us | — | Follow us */}
      <div className="mt-8 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-[1fr_1fr_1fr_9rem]">
        <VerticalMenu
          className="min-w-0"
          menuName="services"
          baseUrl="services"
        />
        <VerticalMenu className="min-w-0 xl:pl-4" menuName="about_us" baseUrl="" />

        {/* Follow Us Section */}
        <div className="flex flex-col sm:col-start-3 xl:col-start-4 xl:pl-4">
          <h3 className="mb-3 text-base font-bold">
            {(follow_us_text?.value as string | undefined) ?? 'Follow us'}:
          </h3>
          <div className="flex items-center gap-3">
            <SocialButtons />
          </div>
        </div>
      </div>

      {/* Copyrights */}
      <div className="mt-10 text-sm">
        <Copyrights />
      </div>
    </div>
  );
};

export default MenuSection;
