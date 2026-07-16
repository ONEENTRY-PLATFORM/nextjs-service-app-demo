import type { Metadata } from 'next';
import type { JSX } from 'react';

import { getPageByUrl } from '@/app/api';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import BookingWizard from '@/components/layout/booking-page';
import BookingAnimations from '@/components/layout/booking-page/animations/BookingAnimations';
import BookingHero from '@/components/layout/booking-page/BookingHero';

import { getBookingData } from './booking-data';

/**
 * CMS content is the same for everyone — prerender this route and refresh it
 * on a timer (ISR) instead of rendering it per request.
 */
export const dynamic = 'force-static';
export const revalidate = 300;

/**
 * BookingPageLayout — the booking page following the static-html mock
 * (`BookingPage.tsx`): a photo hero under the purple→pink veil and the
 * step-based booking wizard (entry screen, step bar, cross-filtered steps,
 * "Your Appointment" summary and the success modal).
 *
 * The page renders with whatever the CMS currently has — a missing `booking`
 * page only drops the custom title, and an empty catalog/roster leaves the
 * corresponding wizard steps empty (see `booking-data.ts`).
 * @returns {Promise<JSX.Element>} JSX.Element representing the page
 */
const BookingPageLayout = async (): Promise<JSX.Element> => {
  /** Independent reads — run in parallel. */
  const [dictionary, pageResult, data] = await Promise.all([
    getDictionary(),
    getPageByUrl('booking'),
    getBookingData(),
  ]);
  ServerProvider('dict', dictionary);

  const title = pageResult.page?.localizeInfos?.title || 'Book Online';
  const locations = data.salons.length;
  const subtitle = `Premium beauty experience${
    locations > 0 ? ` · ${locations} location${locations > 1 ? 's' : ''}` : ''
  }`;

  return (
    <BookingAnimations className="flex min-h-screen w-full flex-col bg-white">
      <BookingHero title={title} subtitle={subtitle} />
      <BookingWizard data={data} />
    </BookingAnimations>
  );
};

export default BookingPageLayout;

/**
 * Generate page metadata
 * @async
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 * @returns {Promise<Metadata>} metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  /** get page by Url */
  const { page, isError } = await getPageByUrl('booking');

  if (isError || !page) {
    return { title: 'Book Online' };
  }

  /** extract data from page */
  const { localizeInfos } = page;

  return {
    title: localizeInfos?.title,
    description: localizeInfos?.title,
    openGraph: {
      type: 'article',
    },
  };
}
