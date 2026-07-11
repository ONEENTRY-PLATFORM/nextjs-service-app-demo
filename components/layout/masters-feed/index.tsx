import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

import TitleAnimations from '@/app/animations/TitleAnimations';
import { getAdminsInfo } from '@/app/api';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import getLocalMasters from '@/app/masters/getLocalMasters';
import type { MasterItem } from '@/components/layout/masters-page/taxonomy';

import MastersFeedCarousel from './components/MastersCarousel';
import SpecialistsDemoGrid from './components/SpecialistsDemoGrid';

/** How many specialists the home strip shows */
const STRIP_LENGTH = 6;

/**
 * Pick a cross-discipline spread from the demo roster — the first specialist of
 * each profession section, then fill up to {@link STRIP_LENGTH} — so the strip
 * shows variety like the static-html mock, not six hair stylists.
 * @param   {MasterItem[]} roster - Full demo roster
 * @returns {MasterItem[]}        Trimmed, varied selection
 */
const pickStrip = (roster: MasterItem[]): MasterItem[] => {
  const bySection = new Map<string, MasterItem>();
  for (const master of roster) {
    if (!bySection.has(master.section)) {
      bySection.set(master.section, master);
    }
  }
  const spread = [...bySection.values()];
  const seen = new Set(spread.map((master) => master.id));
  for (const master of roster) {
    if (spread.length >= STRIP_LENGTH) break;
    if (!seen.has(master.id)) {
      spread.push(master);
      seen.add(master.id);
    }
  }
  return spread.slice(0, STRIP_LENGTH);
};

/**
 * MastersFeed section component that displays a carousel of masters
 * @param   {object}               props       - Component properties
 * @param   {IBlockEntity}         props.block - Block entity containing section title and other metadata
 * @returns {Promise<JSX.Element>}             Promise resolving to a JSX element with masters carousel
 */
const MastersFeed = async ({
  block,
}: {
  block?: IBlockEntity | undefined;
}): Promise<JSX.Element> => {
  /** Get dictionary for localization */
  const [dict] = ServerProvider<IAttributeValues>('dict');
  /** Fetch admin information (masters) */
  const { admins } = await getAdminsInfo({ body: [], offset: 0, limit: 100 });

  /** Filter admins to only include those with services attribute */
  const masters = (admins || []).filter((master): master is IAdminEntity =>
    Boolean(master.attributeValues?.services),
  );
  /** No CMS masters yet → render the mock's demo roster (content plan, stage 4) */
  const usingDemo = masters.length === 0;

  /**
   * Section heading: the CMS block title once real masters exist, otherwise the
   * mock's "Our Specialists" — the placeholder `home_masters` block title
   * ("Home masters") is not design copy, so the demo strip ignores it.
   */
  const title = usingDemo
    ? 'Our Specialists'
    : block?.localizeInfos?.title || 'Our Specialists';

  return (
    <section className="flex w-screen flex-col justify-center py-5">
      <div className="flex w-full flex-col bg-white">
        <TitleAnimations
          delay={0.25}
          className="mx-auto mb-12 flex w-auto flex-col gap-4"
        >
          <h2 className="title self-center text-4xl leading-8 font-light text-gray-600 uppercase">
            {title}
          </h2>
          <hr className="relative mb-2.5 h-px w-full max-w-37.5 self-center border-b border-solid border-b-gray-600" />
        </TitleAnimations>
        {/**
         * Use CMS masters once stage-4 admins exist; until then fall back to the
         * mock's demo roster so the home strip matches the design.
         */}
        {usingDemo ? (
          <SpecialistsDemoGrid masters={pickStrip(getLocalMasters())} />
        ) : (
          <MastersFeedCarousel masters={masters} dict={dict} />
        )}
      </div>
    </section>
  );
};

export default MastersFeed;
