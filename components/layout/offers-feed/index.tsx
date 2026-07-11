import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

import TitleAnimations from '@/app/animations/TitleAnimations';

import OffersFeed from './components/OffersFeed';

/**
 * OffersFeedBlock component displays the complete offers section with title and feed
 * @param   {object}               props       - Component properties
 * @param   {IBlockEntity}         props.block - Block entity containing offer data and section title
 * @returns {Promise<JSX.Element>}             Promise resolving to a JSX element representing the complete offers section
 */
const OffersFeedBlock = async ({
  block,
}: {
  block?: IBlockEntity | undefined;
}): Promise<JSX.Element> => {
  /** Section heading; falls back to the mock's "Best Offers" when the block is not filled */
  const title = block?.localizeInfos?.title || 'Best Offers';

  return (
    <section className="flex w-full justify-center bg-white py-10 pb-4">
      <div className="mx-auto mb-6 w-full max-w-350 flex-col px-5 max-md:max-w-full">
        <div className="flex w-full flex-col items-center justify-center">
          <TitleAnimations
            delay={0.25}
            className="mx-auto mb-12 flex w-fit flex-col gap-4"
          >
            <h2 className="title self-center text-4xl leading-8 font-light tracking-widest text-ink uppercase">
              {title}
            </h2>
            <hr className="relative mb-2.5 h-px w-full self-center border-b border-solid border-b-gray-600" />
          </TitleAnimations>
          <OffersFeed block={block} />
        </div>
      </div>
    </section>
  );
};

export default OffersFeedBlock;
