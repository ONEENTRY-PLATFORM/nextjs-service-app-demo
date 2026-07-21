import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

import HeroAnimations from '@/app/animations/HeroAnimations';
import { getBlockSlides } from '@/app/api/server/blocks/getBlockSlides';

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

  /** Map visible slides to their image pair and CMS text overlay */
  const heroSlides: HeroSlide[] = (slides?.items ?? [])
    .filter((slide) => slide.visible)
    .map((slide) => {
      const attrs = slide.attributeValues as unknown as
        Record<string, unknown> | undefined;
      /**
       * First `downloadLink` of a raw slide file marker.
       * @param   {string} marker - Slide file marker (e.g. `image_id1`)
       * @returns {string}        First file URL, or `''` when absent
       */
      const fileLink = (marker: string): string => {
        const arr = attrs?.[marker] as
          Array<{ downloadLink?: string }> | undefined;
        return arr?.[0]?.downloadLink ?? '';
      };
      /**
       * Trimmed value of a raw slide string marker.
       * @param   {string} marker - Slide string marker (e.g. `string_id3`)
       * @returns {string}        Trimmed string value, or `''` when absent
       */
      const str = (marker: string): string => {
        const value = attrs?.[marker];
        return typeof value === 'string' ? value.trim() : '';
      };
      const desktop = fileLink('image_id1');
      const mobile = fileLink('image_id2') || desktop;
      return {
        desktop,
        mobile,
        title: str('string_id3'),
        text: str('string_id4'),
        sale: str('string_id5'),
        buttonText: str('string_id6'),
        buttonLink: str('string_id7'),
      };
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
