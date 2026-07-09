import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import HeroAnimations from '@/app/animations/HeroAnimations';

import ServiceDescription from './components/ServiceDescription';
import ServiceImage from './components/ServiceImage';
import ServiceTitle from './components/ServiceTitle';

/**
 * ServiceHero component renders the hero section for service pages
 * This component displays the service page title, description and related images
 * @param   {object}       props      - Component properties
 * @param   {IPagesEntity} props.page - IPagesEntity type, object containing page data
 * @returns {JSX.Element}             JSX.Element - Returns rendered service page hero section
 */
const ServiceHero = ({ page }: { page: IPagesEntity }): JSX.Element => {
  return (
    /** Main container using HeroAnimations wrapper for animations */
    <HeroAnimations className="relative flex flex-col justify-center">
      <div className="mx-auto flex w-full max-w-(--breakpoint-lg) items-center justify-center px-5 max-md:px-5">
        <div className="relative mx-auto flex min-h-97.5 w-full max-w-360 flex-row items-end justify-between py-8 pr-36 pl-12 max-lg:min-h-70 max-lg:px-5 max-md:min-h-70 max-md:max-w-full max-md:flex-wrap max-sm:mr-auto">
          <div className="relative mt-auto flex flex-col text-left font-bold text-white max-xl:mr-auto max-md:mt-10 max-sm:mx-auto">
            <ServiceTitle page={page} />
            <ServiceDescription page={page} />
          </div>
        </div>
      </div>
      <ServiceImage page={page} />
    </HeroAnimations>
  );
};

export default ServiceHero;
