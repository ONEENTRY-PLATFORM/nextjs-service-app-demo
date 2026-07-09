import parse from 'html-react-parser';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

import TitleAnimations from '@/app/animations/TitleAnimations';
import wrapCharactersInSpan from '@/components/hooks/wrapCharactersInSpan';

import BgAnimations from './animations/BgAnimations';
import CatalogGrid from './components/CatalogGrid';

/**
 * CatalogSection component to render the main service catalog section.
 *
 * This component displays the main catalog section with a title and a grid of service categories.
 * It includes background animations with "Beauty Salon" text and title animations for enhanced
 * visual presentation. The component uses data from a block entity to display localized content.
 * @param   {object}       props       - Component properties
 * @param   {IBlockEntity} props.block - Block entity containing localized information for the section title
 * @returns {JSX.Element}              JSX.Element representing the complete catalog section with background animations
 */
const CatalogSection = ({ block }: { block: IBlockEntity }): JSX.Element => {
  /** Extract title from block's localized information */
  const title = block?.localizeInfos?.title;

  /** Wrap title words in spans for animation effects */
  const title1 = wrapCharactersInSpan('Beauty');
  const title2 = wrapCharactersInSpan('Salon');

  /** Render catalog section with title, grid and background elements */
  return (
    <section className="relative flex shrink-0 flex-col">
      <div className="relative mx-auto flex w-full max-w-300 shrink-0 grow flex-col self-stretch">
        {/* title */}
        <TitleAnimations className="mx-auto mb-10 flex w-auto flex-col gap-4">
          <h2 className="title text-center text-4xl font-light text-gray-600 uppercase">
            {title}
          </h2>
          <hr className="relative mb-2.5 h-px w-full max-w-37.5 self-center border-b border-solid border-b-gray-600" />
        </TitleAnimations>
        {/* pages */}
        <div className="relative z-10 flex shrink-0 flex-row flex-wrap justify-center gap-12">
          <CatalogGrid />
        </div>
      </div>
      {/* section-bg */}
      <BgAnimations className="section-bg text-center text-[24rem] leading-56 text-gray-50 uppercase">
        <div id="beauty_bg" className="font-bold">
          {parse(title1)}
        </div>
        <div id="salon_bg" className="font-light">
          {parse(title2)}
        </div>
      </BgAnimations>
    </section>
  );
};

export default CatalogSection;
