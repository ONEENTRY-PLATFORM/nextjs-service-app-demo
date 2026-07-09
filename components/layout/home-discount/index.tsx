import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

import BannerAnimations from './animations/BannerAnimations';
import BanerDescription from './components/BanerDescription';
import BanerImage from './components/BanerImage';
import BanerLink from './components/BanerLink';
import BanerPhone from './components/BanerPhone';
import BanerTitle from './components/BanerTitle';

/**
 * HomeDiscount section component.
 * @param   {object}       props       - The properties object.
 * @param   {IBlockEntity} props.block - The block data containing attributes for the section.
 * @returns {JSX.Element}              JSX.Element representing the HomeDiscount section.
 */
const HomeDiscount = ({ block }: { block: IBlockEntity }): JSX.Element => {
  /** Return empty fragment if block data is not provided */
  if (!block) {
    return <></>;
  }
  /** Render home discount section with banner animations and content */
  return (
    <section className="flex items-center justify-center bg-white px-16 py-5 text-ink max-md:px-5">
      <BannerAnimations className="flex w-266.25 max-w-full flex-col justify-center overflow-hidden rounded-[50px] bg-fuchsia-500">
        <div className="relative flex min-h-85 w-full flex-col items-end overflow-hidden px-20 py-12 pt-8 text-center max-md:px-10">
          <BanerImage block={block} />
          <div className="relative ml-auto box-border flex shrink-0 flex-col items-center">
            <BanerTitle block={block} />
            <BanerLink block={block} />
            <BanerDescription block={block} />
            <BanerPhone block={block} />
          </div>
        </div>
      </BannerAnimations>
    </section>
  );
};

export default HomeDiscount;
