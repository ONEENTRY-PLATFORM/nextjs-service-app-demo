import type { Metadata } from 'next';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import RevealAnimations from '@/app/animations/RevealAnimations';
import { getBlockByMarker } from '@/app/api/server/blocks/getBlockByMarker';
import { getChildPagesByParentUrl } from '@/app/api/server/pages/getChildPagesByParentUrl';
import { getPageByUrl } from '@/app/api/server/pages/getPageByUrl';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { cmsPageMetadata } from '@/app/utils/cmsPageMetadata';
import { salonMapLinks } from '@/app/utils/salonMapLinks';
import BookCtaBanner from '@/components/layout/contacts-page/BookCtaBanner';
import ContactFormCard from '@/components/layout/contacts-page/ContactFormCard';
import ContactInfoCard from '@/components/layout/contacts-page/ContactInfoCard';
import ContactsHero from '@/components/layout/contacts-page/ContactsHero';
import OpeningHours from '@/components/layout/contacts-page/OpeningHours';
import type { ContactSalon } from '@/components/layout/contacts-page/SalonLocations';
import SalonLocations from '@/components/layout/contacts-page/SalonLocations';
import SectionHeading from '@/components/shared/SectionHeading';
import { formatUaePhone } from '@/components/utils/formatUaePhone';
import parseOpeningTime from '@/components/utils/parseOpeningTime';
import { salonFromPage } from '@/components/utils/salonFromPage';
import summarizeOpeningHours from '@/components/utils/summarizeOpeningHours';

/**
 * CMS content is the same for everyone — prerender this route and refresh it
 * on a timer (ISR) instead of rendering it per request.
 */
export const dynamic = 'force-static';
export const revalidate = 300;

/** Card accent colors cycled over the salon cards (mock: PINK, CYAN, PURPLE) */
const SALON_COLORS = ['#ed21f1', '#109aa9', '#9b4fb2'];

/**
 * Map a CMS salon page onto the location card shape. A salon without the
 * `salon_address` attribute is unusable for the design and is dropped.
 * @param   {IPagesEntity}        page  - CMS salon child page
 * @param   {number}              index - Position in the list (accent color cycling)
 * @returns {ContactSalon | null}       Normalized salon or `null` when the address is empty
 */
const toContactSalon = (
  page: IPagesEntity,
  index: number,
): ContactSalon | null => {
  const salon = salonFromPage(page);
  /** A salon with no address has nothing to show on a map — skip the card. */
  if (!salon.address) return null;

  return {
    id: salon.id,
    url: salon.url,
    name: salon.name,
    address: salon.address,
    phone: formatUaePhone(salon.phone),
    ...salonMapLinks(salon),
    color: SALON_COLORS[index % SALON_COLORS.length] ?? '#ed21f1',
  };
};

/**
 * ContactsPageLayout component renders the contacts page following the
 * static-html mock (`ContactsPage.tsx`): mobile gradient strip / desktop
 * photo hero, stats strip, "Our Locations" salon cards with maps, the
 * "Get in Touch" form + info sidebar, "Opening Hours" and the booking CTA
 * banner.
 *
 * Salons come from the CMS `salons` child pages (those with a `salon_address`);
 * when none exist the "Our Locations" list is simply empty — the page never
 * 404s over missing salons.
 * @returns {Promise<JSX.Element>} JSX.Element representing the contacts page
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 */
const ContactsPageLayout = async (): Promise<JSX.Element> => {
  /** All four fetches are independent — run in parallel. */
  const [dict, { page }, salonsResult, openingResult] = await Promise.all([
    getDictionary(),
    getPageByUrl('contacts'),
    getChildPagesByParentUrl('salons'),
    getBlockByMarker('opening_time'),
  ]);
  ServerProvider('dict', dict);

  /**
   * A missing or errored `contacts` page only drops the custom heading — salon
   * cards and opening hours are read independently and degrade on their own. A
   * transient CMS failure must not 404 this static route.
   */

  /** Salon location cards come from the CMS `salons` child pages. */
  const salons: ContactSalon[] = (salonsResult.pages ?? [])
    .map(toContactSalon)
    .filter((salon): salon is ContactSalon => salon !== null);

  /** "Reach out" phone/address come from the first salon that has an address. */
  const primarySalon = (salonsResult.pages ?? [])
    .map(salonFromPage)
    .find((salon) => salon.address);

  /** CMS schedule — an empty week hides the "Opening Hours" section. */
  const openingRows = parseOpeningTime(
    openingResult.block?.attributeValues?.opening_time?.value,
  );
  /** Counters strip: the hours cell only works while the week is uniform. */
  const openingSummary = summarizeOpeningHours(openingRows);

  const title =
    page?.localizeInfos?.title ??
    (dict?.contacts_title?.value as string | undefined) ??
    'Contacts';

  return (
    <div className="bg-white" data-testid="contacts-page">
      {/* Mobile: thin gradient strip instead of the hero */}
      <div className="h-1.25 bg-gradient-stats md:hidden" />

      {/* Hero + stats strip (desktop only) — revealed together as one header */}
      <ContactsHero
        title={title}
        subtitle={`${salons.length} ${
          (dict?.contacts_locations_suffix?.value as string | undefined) ||
          'locations · Always happy to see you'
        }`}
        stats={[
          [
            salons.length,
            (dict?.services_stat_locations?.value as string | undefined) ||
              'Locations',
          ],
          ...(openingSummary
            ? ([
                [
                  (dict?.stat_daily_text?.value as string | undefined) ||
                    'Daily',
                  openingSummary.hours,
                ],
              ] as Array<[string, string]>)
            : []),
          ['Dubai', 'UAE'],
        ]}
      />

      {/* Location cards */}
      <SalonLocations salons={salons} />

      {/* Get in touch */}
      <section className="bg-white pt-2 pb-6 md:pt-6 md:pb-10">
        <div className="page-shell">
          <SectionHeading className="mb-6 md:mb-10">
            {(dict?.get_in_touch_title?.value as string | undefined) ||
              'Get in Touch'}
          </SectionHeading>
          <RevealAnimations className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ContactFormCard />
            </div>
            <div className="lg:col-span-2">
              <ContactInfoCard
                salon={primarySalon}
                hours={openingSummary?.hours ?? null}
              />
            </div>
          </RevealAnimations>
        </div>
      </section>

      {/* Opening hours */}
      {openingRows.length > 0 && (
        <RevealAnimations>
          <OpeningHours rows={openingRows} />
        </RevealAnimations>
      )}

      {/* Book CTA banner */}
      <RevealAnimations>
        <BookCtaBanner />
      </RevealAnimations>
    </div>
  );
};

export default ContactsPageLayout;

/**
 * Generate page metadata for the contacts page
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 * @returns {Promise<Metadata>} - Metadata for the contacts page
 */
export async function generateMetadata(): Promise<Metadata> {
  return cmsPageMetadata({
    pageUrl: 'contacts',
    path: '/contacts',
    fallbackTitle: 'Contacts',
    fallbackDescription: 'Contact information',
  });
}
