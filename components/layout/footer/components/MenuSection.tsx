import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import ContactInfo from './ContactInfo';
import Copyrights from './Copyrights';
import OpeningTime from './OpeningTime';
import SocialButtons from './SocialButtons';
import VerticalMenu from './VerticalMenu';

/**
 * MenuSection component to render the main content of the footer.
 *
 * This component displays various sections in the footer including contact information,
 * vertical menus (services and about us), opening times, and social media buttons.
 * It uses a responsive layout that adapts to different screen sizes.
 * @param   {object}           props      - Component properties
 * @param   {IAttributeValues} props.dict - Dictionary object containing localized text values from OneEntry CMS
 * @returns {JSX.Element}                 JSX.Element representing the footer menu section with all its components
 */
const MenuSection = ({ dict }: { dict: IAttributeValues }): JSX.Element => {
  const { opening_time_text, follow_us_text } = dict;

  return (
    <div className="mx-auto flex w-full max-w-360 justify-between gap-10 px-5 py-16 text-black max-lg:flex-wrap max-lg:justify-center max-md:max-w-full max-sm:gap-0">
      {/* Contact Information */}
      <ContactInfo />

      {/* Main Content Section */}
      <div className="relative box-border flex shrink-0 flex-row gap-9 max-md:gap-2 max-sm:w-full max-sm:flex-row max-sm:flex-wrap">
        {/* Services Menu */}
        <VerticalMenu
          className="flex w-auto flex-col gap-5 px-2.5 max-md:mr-auto max-sm:mr-4 max-sm:w-[35%] max-sm:px-0"
          menuName="services"
          baseUrl="services"
        />

        {/* About Us Menu */}
        <VerticalMenu
          className="flex flex-col gap-5 px-2.5 max-md:mr-9 max-sm:mr-0 max-sm:w-6/12 max-sm:px-0"
          menuName="about_us"
          baseUrl=""
        />

        {/* Opening Times */}
        <div className="flex min-w-65.5 grow flex-col border border-solid border-black p-5 max-md:pb-5 max-sm:w-full max-sm:min-w-50">
          <h3 className="mb-3.5 text-lg font-bold">
            {opening_time_text?.value as string | undefined}
          </h3>
          <div className="flex flex-col gap-2 text-base leading-5 whitespace-nowrap">
            <OpeningTime />
          </div>
        </div>

        {/* Follow Us Section */}
        <div className="hidden w-33.5 max-w-full flex-col max-sm:flex max-sm:w-full">
          <h3 className="mb-3 text-sm font-bold">
            {follow_us_text?.value as string | undefined}:
          </h3>
          <div className="mb-2 flex items-end justify-around gap-5 max-sm:justify-start">
            <SocialButtons />
          </div>
        </div>

        {/* Copyrights */}
        <div className="mb-4 hidden text-left text-base font-medium tracking-wide max-md:max-w-full max-sm:flex max-sm:text-left">
          <Copyrights />
        </div>
      </div>
    </div>
  );
};

export default MenuSection;
