'use client';

import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

import HeroAnimations from '@/app/animations/HeroAnimations';

import HeroBgImage from './components/HeroBgImage';
import HeroButton from './components/HeroButton';
import HeroDescription from './components/HeroDescription';
import HeroTitle from './components/HeroTitle';

/**
 * HomeHero section component.
 * @param   {object}       props       - The props for the HomeHero component.
 * @param   {IBlockEntity} props.block - The block data containing attributes for the section.
 * @returns {JSX.Element}              JSX.Element representing the HomeHero section.
 */
const HomeHero = ({ block }: { block: IBlockEntity }): JSX.Element => {
  /** Extract attribute values from the block entity */
  const { attributeValues } = block;

  /** Render home hero section with animated background and content */
  return (
    <HeroAnimations className="relative flex flex-col justify-center overflow-hidden">
      <div className="relative mx-auto flex w-full max-w-360 items-center justify-center px-5 max-md:max-w-full max-md:px-5">
        <div className="relative mx-auto flex min-h-168.75 w-full max-w-360 flex-row items-end justify-between pr-36 pb-16 pl-12 max-lg:min-h-120 max-lg:px-5 max-md:min-h-120 max-md:max-w-full max-md:flex-wrap max-sm:mr-auto">
          <div className="relative mt-auto flex flex-col text-left font-black text-white max-xl:mr-auto max-md:mt-10 max-sm:mx-auto">
            <HeroTitle attributeValues={attributeValues} />
            <HeroDescription attributeValues={attributeValues} />
          </div>
          <HeroButton attributeValues={attributeValues} />
        </div>
      </div>
      <HeroBgImage attributeValues={attributeValues} />
    </HeroAnimations>
  );
};

export default HomeHero;
