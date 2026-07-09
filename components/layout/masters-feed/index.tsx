import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

import TitleAnimations from '@/app/animations/TitleAnimations';
import { getAdminsInfo } from '@/app/api';
import { ServerProvider } from '@/app/store/providers/ServerProvider';

import MastersFeedCarousel from './components/MastersCarousel';

/**
 * MastersFeed section component that displays a carousel of masters
 * @param   {object}               props       - Component properties
 * @param   {IBlockEntity}         props.block - Block entity containing section title and other metadata
 * @returns {Promise<JSX.Element>}             Promise resolving to a JSX element with masters carousel
 */
const MastersFeed = async ({
  block,
}: {
  block: IBlockEntity;
}): Promise<JSX.Element> => {
  /** Get dictionary for localization */
  const [dict] = ServerProvider<IAttributeValues>('dict');
  /** Fetch admin information (masters) */
  const { admins } = await getAdminsInfo({ body: [], offset: 0, limit: 100 });

  /** Filter admins to only include those with services attribute */
  const masters = (admins || []).filter((master): master is IAdminEntity =>
    Boolean(master.attributeValues?.services),
  );

  return (
    <section className="flex w-screen flex-col justify-center py-5">
      <div className="flex w-full flex-col bg-white">
        <TitleAnimations
          delay={0.25}
          className="mx-auto mb-12 flex w-auto flex-col gap-4"
        >
          <h2 className="title self-center text-4xl leading-8 font-light text-gray-600 uppercase">
            {block.localizeInfos?.title || ''}
          </h2>
          <hr className="relative mb-2.5 h-px w-full max-w-37.5 self-center border-b border-solid border-b-gray-600" />
        </TitleAnimations>
        <MastersFeedCarousel masters={masters} dict={dict} />
      </div>
    </section>
  );
};

export default MastersFeed;
