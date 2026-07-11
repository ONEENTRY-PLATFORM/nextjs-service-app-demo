import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IBlockEntity } from 'oneentry/dist/blocks/blocksInterfaces';
import type { JSX } from 'react';

import TitleAnimations from '@/app/animations/TitleAnimations';
import { getAdminsInfo } from '@/app/api';
import getLocalMasters from '@/app/masters/getLocalMasters';
import type { MasterItem } from '@/components/layout/masters-page/taxonomy';
import { sectionOfRole } from '@/components/layout/masters-page/taxonomy';

import SpecialistsGrid from './components/SpecialistsGrid';

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
 * Extract a usable URL from a CMS file attribute value — tolerates the admin
 * `master_image` shape (`[{ downloadLink: string, … }]`) as well as the
 * `{ default: string[] }` link shape used elsewhere.
 * @param   {unknown} value - Raw `attributeValues.<marker>.value`
 * @returns {string}        File URL or `''`
 */
const fileUrl = (value: unknown): string => {
  if (!Array.isArray(value) || value.length === 0) return '';
  const first = value[0] as {
    previewLink?: string | { default?: string[] };
    downloadLink?: string | { default?: string[] };
  };
  const link = first?.previewLink ?? first?.downloadLink;
  if (!link) return '';
  if (typeof link === 'string') return link;
  return link.default?.[1] ?? link.default?.[0] ?? '';
};

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

  /** `master_salon` is an entity attribute: `[{ title, value: { id } }]` */
  const salonArr = attrs.master_salon?.value as
    Array<{ title?: string; value?: { id?: number } }> | '' | undefined;
  const firstSalon = Array.isArray(salonArr) ? salonArr[0] : undefined;
  const salonName = (firstSalon?.title ?? '').replace(/^Thalia\s+/i, '');
  const salonId =
    firstSalon?.value?.id !== undefined ? String(firstSalon.value.id) : '';

  return {
    id: String(admin.id),
    name,
    role: salonName ? `${shortDescription} · ${salonName}` : shortDescription,
    section: sectionOfRole(shortDescription),
    categories: [],
    salonId,
    rating: Number(attrs.master_rating?.value) || 5,
    photo: fileUrl(attrs.master_image?.value),
    href: `/masters/${admin.id}`,
  };
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
  /** Fetch admin information (masters) */
  const { admins } = await getAdminsInfo({ body: [], offset: 0, limit: 100 });

  /** CMS masters = admins with `master_name` set (content plan, stage 4) */
  const cmsMasters = (admins ?? [])
    .map(toMasterItem)
    .filter((master): master is MasterItem => master !== null);
  /** No CMS masters yet → fall back to the mock's demo roster */
  const usingDemo = cmsMasters.length === 0;
  /** CMS masters (capped to the strip length) or the varied demo spread */
  const specialists = usingDemo
    ? pickStrip(getLocalMasters())
    : cmsMasters.slice(0, STRIP_LENGTH);

  return (
    <section className="flex w-screen flex-col justify-center py-5">
      <div className="flex w-full flex-col bg-white">
        <TitleAnimations
          delay={0.25}
          className="mx-auto mb-12 flex w-auto flex-col gap-4"
        >
          <h2 className="title self-center text-4xl leading-8 font-light text-gray-600 uppercase">
            {block?.localizeInfos?.title || 'Our Specialists'}
          </h2>
          <hr className="relative mb-2.5 h-px w-full max-w-37.5 self-center border-b border-solid border-b-gray-600" />
        </TitleAnimations>
        {/** CMS masters once stage-4 admins exist; the mock's demo roster until then */}
        <SpecialistsGrid masters={specialists} />
      </div>
    </section>
  );
};

export default MastersFeed;
