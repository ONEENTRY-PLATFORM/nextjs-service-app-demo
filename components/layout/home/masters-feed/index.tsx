import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

import { getMastersList } from '@/app/api/utils/getMastersList';
import { entityLinks } from '@/app/utils/entityLinks';
import { salonLabel } from '@/app/utils/salonLabel';
import type { MasterItem } from '@/components/layout/masters-page/taxonomy';
import { sectionOfRole } from '@/components/layout/masters-page/taxonomy';
import SectionTitle from '@/components/shared/SectionTitle';
import { fileBlurDataUrl } from '@/components/utils/fileBlurDataUrl';
import { fileDisplayUrl } from '@/components/utils/fileDisplayUrl';

import SpecialistsGrid from './components/SpecialistsGrid';

/** How many specialists the home strip shows */
const STRIP_LENGTH = 6;

/**
 * Map a CMS admin onto the normalized specialist shape the home strip renders.
 * A master is an admin with `master_name` set (content plan, stage 4); other
 * admins map to `null` and are dropped. The role line is
 * `<short description> · <salon>` (the salon's `Thalia ` prefix trimmed) as in
 * the demo roster, and the tile links to the master's profile.
 * @param   {IAdminEntity}      admin - CMS admin entity
 * @returns {MasterItem | null}       Normalized specialist, or `null` when `master_name` is empty
 */
const toMasterItem = (admin: IAdminEntity): MasterItem | null => {
  const attrs = admin.attributeValues ?? {};
  const name = (attrs.master_name?.value as string | undefined) ?? '';
  if (!name) return null;

  const shortDescription =
    (attrs.master_short_description?.value as string | undefined) ||
    'Specialist';

  const firstSalon = entityLinks(attrs.master_salon?.value)[0];
  const salonName = salonLabel(firstSalon?.title);
  const salonId = typeof firstSalon?.id === 'number' ? firstSalon.id : null;

  return {
    id: String(admin.id),
    name,
    role: salonName ? `${shortDescription} · ${salonName}` : shortDescription,
    section: sectionOfRole(shortDescription),
    categories: [],
    salonId,
    rating: Number(attrs.master_rating?.value) || 5,
    photo: fileDisplayUrl(attrs.master_image?.value),
    photoBlur: fileBlurDataUrl(attrs.master_image?.value),
    href: `/masters/${admin.id}`,
  };
};

/**
 * MastersFeed section component that displays a carousel of masters
 * @param   {object}                      props       - Component properties
 * @param   {IBlockEntity}                props.block - Block entity containing section title and other metadata
 * @returns {Promise<JSX.Element | null>}             The masters carousel, or `null` when the CMS has no masters
 */
const MastersFeed = async ({
  block,
}: {
  block?: IBlockEntity | undefined;
}): Promise<JSX.Element | null> => {
  /** Fetch admin information (masters) */
  const { admins } = await getMastersList();

  /** CMS masters = admins with `master_name` set (content plan, stage 4) */
  const specialists = (admins ?? [])
    .map(toMasterItem)
    .filter((master): master is MasterItem => master !== null)
    .slice(0, STRIP_LENGTH);

  /** No masters in the CMS — hide the section instead of an empty carousel. */
  if (specialists.length === 0) {
    return null;
  }

  return (
    <section
      className="flex w-full flex-col justify-center py-4 xl:py-10 md:py-6"
      data-testid="home-masters"
    >
      <div className="flex w-full flex-col bg-white">
        <SectionTitle
          title={block?.localizeInfos?.title || 'Our Specialists'}
          delay={0.25}
          className="mb-6 md:mb-10"
        />
        <SpecialistsGrid masters={specialists} />
      </div>
    </section>
  );
};

export default MastersFeed;
