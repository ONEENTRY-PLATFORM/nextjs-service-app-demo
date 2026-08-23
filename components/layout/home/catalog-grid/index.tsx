import parse from 'html-react-parser';
import type { IAttributeValues, IBlockEntity } from 'oneentry/types';
import type { JSX } from 'react';

import { ServerProvider } from '@/app/store/providers/ServerProvider';
import wrapCharactersInSpan from '@/components/hooks/wrapCharactersInSpan';
import SectionTitle from '@/components/shared/SectionTitle';
import { dictText } from '@/components/utils/dictText';

import BgAnimations from './animations/BgAnimations';
import CatalogGrid from './components/CatalogGrid';

/**
 * CatalogSection component to render the main service catalog section.
 * @param   {object}       props         - Component properties
 * @param   {IBlockEntity} [props.block] - Block entity with the section title; falls back to the mock's "Service" heading when the block is not filled in the CMS yet
 * @returns {JSX.Element}                JSX.Element representing the complete catalog section with background animations
 */
const CatalogSection = ({
  block,
}: {
  block?: IBlockEntity | undefined;
}): JSX.Element => {
  /** UI-text dictionary (system_content) with English fallbacks */
  const [dict] = ServerProvider<IAttributeValues>('dict');
  /** Extract title from block's localized information */
  const title =
    block?.localizeInfos?.title ??
    dictText(dict, 'home_catalog_title', 'Service');

  /** Wrap title words in spans for animation effects */
  const title1 = wrapCharactersInSpan('Beauty');
  const title2 = wrapCharactersInSpan('Studio');

  /** Render catalog section with title, grid and background elements */
  return (
    <section
      data-testid="home-catalog"
      className="relative flex min-h-0 shrink-0 flex-col justify-center overflow-hidden bg-white py-2 xl:min-h-112 xl:py-10 md:max-xl:min-h-80 md:max-xl:py-6"
    >
      <div className="relative page-shell flex w-full shrink-0 grow flex-col self-stretch">
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
      {/* "Beauty Studio" watermark. */}
      <BgAnimations className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center overflow-hidden text-center text-[clamp(6rem,13vw,13rem)] text-[#e1e5ef]/30 uppercase select-none md:max-xl:text-[clamp(7rem,17vw,13rem)]">
        <div id="beauty_bg" className="font-black" style={{ lineHeight: 1.05 }}>
          {parse(title1)}
        </div>
        <div id="salon_bg" className="font-thin" style={{ lineHeight: 1.05 }}>
          {parse(title2)}
        </div>
      </BgAnimations>
    </section>
  );
};

export default CatalogSection;
