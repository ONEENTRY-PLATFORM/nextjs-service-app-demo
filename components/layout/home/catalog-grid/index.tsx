import parse from 'html-react-parser';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

import wrapCharactersInSpan from '@/components/hooks/wrapCharactersInSpan';
import SectionTitle from '@/components/shared/SectionTitle';

import BgAnimations from './animations/BgAnimations';
import CatalogGrid from './components/CatalogGrid';

/**
 * CatalogSection component to render the main service catalog section.
 *
 * This component displays the main catalog section with a title and a grid of service categories.
 * It includes background animations with "Beauty Salon" text and title animations for enhanced
 * visual presentation. The component uses data from a block entity to display localized content.
 * @param   {object}       props         - Component properties
 * @param   {IBlockEntity} [props.block] - Block entity with the section title; falls back to the mock's "Service" heading when the block is not filled in the CMS yet
 * @returns {JSX.Element}                JSX.Element representing the complete catalog section with background animations
 */
const CatalogSection = ({
  block,
}: {
  block?: IBlockEntity | undefined;
}): JSX.Element => {
  /** Extract title from block's localized information */
  const title = block?.localizeInfos?.title ?? 'Service';

  /** Wrap title words in spans for animation effects */
  const title1 = wrapCharactersInSpan('Beauty');
  const title2 = wrapCharactersInSpan('Studio');

  /** Render catalog section with title, grid and background elements */
  return (
    <section
      data-testid="home-catalog"
      className="relative flex min-h-0 shrink-0 flex-col justify-center overflow-hidden bg-white py-2 xl:min-h-112 xl:py-10 md:min-h-80 md:py-6"
    >
      <div className="relative mx-auto flex w-full max-w-7xl shrink-0 grow flex-col self-stretch px-3 md:px-8">
        {/* title */}
        <SectionTitle title={title} className="mb-6 md:mb-10" />
        {/* pages */}
        <div
          data-testid="catalog-grid"
          className="relative z-10 grid grid-cols-2 place-items-center gap-4 md:grid-cols-4 md:gap-y-10 lg:gap-x-8"
        >
          <CatalogGrid />
        </div>
      </div>
      {/* section-bg */}
      <BgAnimations className="section-bg leading-1.05 text-center text-[clamp(6rem,13vw,13rem)] text-[#e1e5ef]/30 uppercase xl:text-[clamp(6rem,13vw,13rem)] md:text-[clamp(7rem,17vw,13rem)]">
        <div id="beauty_bg" className="font-black">
          {parse(title1)}
        </div>
        <div id="salon_bg" className="font-thin">
          {parse(title2)}
        </div>
      </BgAnimations>
    </section>
  );
};

export default CatalogSection;
