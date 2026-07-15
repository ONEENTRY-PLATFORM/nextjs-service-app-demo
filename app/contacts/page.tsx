import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import { getChildPagesByParentUrl, getPageByUrl } from '@/app/api';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import BookCtaBanner from '@/components/layout/contacts-page/BookCtaBanner';
import ContactFormCard from '@/components/layout/contacts-page/ContactFormCard';
import ContactInfoCard from '@/components/layout/contacts-page/ContactInfoCard';
import ContactsHero from '@/components/layout/contacts-page/ContactsHero';
import OpeningHours from '@/components/layout/contacts-page/OpeningHours';
import type { ContactSalon } from '@/components/layout/contacts-page/SalonLocations';
import SalonLocations from '@/components/layout/contacts-page/SalonLocations';
import StatsStrip from '@/components/layout/services-page/StatsStrip';
import SectionHeading from '@/components/shared/SectionHeading';
import { formatUaePhone } from '@/components/utils';

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
 * `salon_address` attribute is unusable for the design and is dropped — when
 * every salon is dropped the page falls back to the mock's demo studios.
 * @param   {IPagesEntity}        page  - CMS salon child page
 * @param   {number}              index - Position in the list (accent color cycling)
 * @returns {ContactSalon | null}       Normalized salon or `null` when the address is empty
 */
const toContactSalon = (
  page: IPagesEntity,
  index: number,
): ContactSalon | null => {
  const attrs = page.attributeValues ?? {};
  const address = (attrs.salon_address?.value as string | undefined) ?? '';
  if (!address) return null;

  const phone = (attrs.salon_phone?.value as string | undefined) ?? '';
  const phoneFormatted = formatUaePhone(phone);
  /** The CMS holds no coordinates — build the map links from the address */
  const query = encodeURIComponent(address);

  return {
    id: String(page.id),
    url: page.pageUrl,
    name: page.localizeInfos?.title ?? 'Salon',
    address,
    phone: phoneFormatted,
    tel: (phone || phoneFormatted).replace(/[^+\d]/g, ''),
    mapSrc: `https://www.google.com/maps?q=${query}&z=15&hl=en&output=embed`,
    mapsLink: `https://www.google.com/maps/dir/?api=1&destination=${query}`,
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
  /** All three fetches are independent — run in parallel. */
  const [dict, { page, isError }, salonsResult] = await Promise.all([
    getDictionary(),
    getPageByUrl('contacts'),
    getChildPagesByParentUrl('salons'),
  ]);
  ServerProvider('dict', dict);

  if (!page || isError) {
    return notFound();
  }

  /** Salon location cards come from the CMS `salons` child pages. */
  const salons: ContactSalon[] = (salonsResult.pages ?? [])
    .map(toContactSalon)
    .filter((salon): salon is ContactSalon => salon !== null);

  const title = page.localizeInfos?.title ?? 'Contacts';

  return (
    <div className="bg-white">
      {/* Mobile: thin gradient strip instead of the hero */}
      <div className="h-1.25 bg-gradient-stats md:hidden" />

      {/* Hero (desktop only) */}
      <ContactsHero
        title={title}
        subtitle={`${salons.length} locations · Always happy to see you`}
      />

      {/* Stats strip (desktop only) */}
      <div className="hidden md:block">
        <StatsStrip
          stats={[
            [salons.length, 'Locations'],
            ['Daily', '10:00–22:00'],
            ['Dubai', 'UAE'],
          ]}
        />
      </div>

      {/* Location cards */}
      <SalonLocations salons={salons} />

      {/* Get in touch */}
      <section className="bg-white pt-2 pb-6 md:pt-6 md:pb-10">
        <div className="mx-auto max-w-7xl px-3 md:px-8">
          <div className="mb-6 text-center md:mb-10">
            <SectionHeading size="lg">Get in Touch</SectionHeading>
          </div>
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ContactFormCard />
            </div>
            <div className="lg:col-span-2">
              <ContactInfoCard />
            </div>
          </div>
        </div>
      </section>

      {/* Opening hours */}
      <OpeningHours />

      {/* Book CTA banner */}
      <BookCtaBanner />
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
  /** get page by Url */
  const { page, isError } = await getPageByUrl('contacts');

  if (isError || !page) {
    return {};
  }

  /** extract data from page */
  const { localizeInfos } = page;

  return {
    title: localizeInfos?.title || 'Contacts',
    description: localizeInfos?.plainValue || 'Contact information',
    openGraph: {
      type: 'article',
    },
  };
}
