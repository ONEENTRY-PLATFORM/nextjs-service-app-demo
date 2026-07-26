import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

import HeroAnimations from '@/app/animations/HeroAnimations';
import { getBlockSlides } from '@/app/api/server/blocks/getBlockSlides';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { getGalleryImageUrls } from '@/components/utils/getGalleryImageUrls';
import type { OneEntryImageFile } from '@/components/utils/OneEntryImageFile';

import type { HeroSlide } from './components/HeroSlider';
import HeroSlider from './components/HeroSlider';

/**
 * HomeHero section component.
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
       * First file of a raw slide file marker: its URL plus the ready-made CMS
       * LQIP (`previewLink`), which the carousel shows as the blur placeholder.
       * Slide files uploaded without previews simply carry no blur.
       * @param   {string}                               marker - Slide file marker (e.g. `image_id1`)
       * @returns {{ url: string; blur: string | null }}        File URL (`''` when absent) and its blur data URI
       */
      const fileLink = (
        marker: string,
      ): { url: string; blur: string | null } => {
        const arr = attrs?.[marker] as OneEntryImageFile[] | undefined;
        const file = arr?.[0];
        if (!file?.downloadLink) {
          return { url: '', blur: null };
        }
        const { full, blur } = getGalleryImageUrls(file);
        return { url: full, blur };
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
      const mobileOwn = fileLink('image_id2');
      const mobile = mobileOwn.url ? mobileOwn : desktop;
      return {
        desktop: desktop.url,
        mobile: mobile.url,
        desktopBlur: desktop.blur ?? undefined,
        mobileBlur: mobile.blur ?? undefined,
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

  /** UI-text dictionary (system_content) with English fallbacks */
  const [dict] = ServerProvider<IAttributeValues>('dict');
  const alt =
    (block.localizeInfos?.title as string | undefined) ||
    (dict?.site_name?.value as string | undefined) ||
    'Thalia Beauty Studio';

  /** Render home hero banner carousel */
  return (
    <HeroAnimations className="relative flex flex-col justify-center overflow-hidden">
      <HeroSlider slides={heroSlides} intervalMs={intervalMs} alt={alt} />
    </HeroAnimations>
  );
};

export default HomeHero;
