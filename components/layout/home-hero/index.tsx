import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

import HeroAnimations from '@/app/animations/HeroAnimations';
import { getBlockSlides } from '@/app/api';

import type { HeroSlide } from './components/HeroSlider';
import HeroSlider from './components/HeroSlider';

/**
 * HomeHero section component.
 *
 * Full-bleed banner carousel from the `home_hero` slider block, as in the
 * static-html mock: the banner artwork carries its own text, so each slide
 * renders only images — `image_id1` on desktop and `image_id2` on mobile.
 * Slides and the auto-advance interval come from the block's slides endpoint.
 * @param   {object}               props       - The props for the HomeHero component.
 * @param   {IBlockEntity}         props.block - The slider block entity (`home_hero`).
 * @returns {Promise<JSX.Element>}             JSX.Element representing the HomeHero section.
 */
const HomeHero = async ({
  block,
}: {
  block: IBlockEntity;
}): Promise<JSX.Element> => {
  /** Fetch slides of the slider block (not part of block attributes) */
  const { slides } = await getBlockSlides(block.identifier);

  /** Map visible slides to desktop/mobile image pairs */
  const heroSlides: HeroSlide[] = (slides?.items ?? [])
    .filter((slide) => slide.visible)
    .map((slide) => {
      /** Slide file attributes are raw arrays, unlike page/block attributes */
      const attrs = slide.attributeValues as unknown as
        | Record<string, Array<{ downloadLink?: string }> | undefined>
        | undefined;
      const desktop = attrs?.image_id1?.[0]?.downloadLink ?? '';
      const mobile = attrs?.image_id2?.[0]?.downloadLink || desktop;
      return { desktop, mobile };
    })
    .filter((slide) => slide.desktop || slide.mobile);

  /** Auto-advance interval from the CMS (default 5s) */
  const intervalMs = slides?.time
    ? slides.time * (slides.timeInterval === 'ms' ? 1 : 1000)
    : 5000;

  const alt =
    (block.localizeInfos?.title as string | undefined) ||
    'Thalia Beauty Studio';

  /** Render home hero banner carousel */
  return (
    <HeroAnimations className="relative flex flex-col justify-center overflow-hidden">
      <HeroSlider slides={heroSlides} intervalMs={intervalMs} alt={alt} />
    </HeroAnimations>
  );
};

export default HomeHero;
