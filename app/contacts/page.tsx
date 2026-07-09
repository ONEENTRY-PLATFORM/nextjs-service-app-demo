import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX, Key } from 'react';

import { getChildPagesByParentUrl, getPageByUrl } from '@/app/api';

import LineAnimations from '../animations/LineAnimations';

const LocationCard = dynamic(
  () => import('@/components/layout/location-card/LocationCard'),
  { ssr: true },
);

/**
 * Contacts page layout component that displays salon locations
 *
 * This component fetches and displays all salon locations in a grid layout.
 * If no locations are available, it shows a message indicating that.
 * @returns {Promise<JSX.Element>} JSX.Element representing the contacts page
 */
const ContactsPageLayout = async (): Promise<JSX.Element> => {
  /** Both calls are independent — run in parallel. */
  const [{ page, isError }, { pages, isError: salonsError }] =
    await Promise.all([
      getPageByUrl('contacts'),
      getChildPagesByParentUrl('salons'),
    ]);

  if (!page || isError || salonsError) {
    return notFound();
  }

  if (!pages || !Array.isArray(pages)) {
    return (
      <>
        <LineAnimations
          className="h-12.5 w-screen bg-gradient-1 xl:h-22.5 sm:h-15 lg:h-20 2xl:h-25"
          delay={0}
        />
        <section className="mx-auto mt-12.5 grid min-h-[50vh] w-screen max-w-360 grid-cols-3 items-center gap-24 bg-white px-5 pt-7 pb-16 max-xl:grid-cols-3 max-lg:grid-cols-2 max-lg:gap-12 max-md:grid-cols-1 max-md:gap-8 max-md:px-5 max-sm:grid-cols-1">
          <p className="col-span-full text-center text-neutral-600">
            No salon locations available at the moment.
          </p>
        </section>
      </>
    );
  }

  return (
    <>
      <LineAnimations
        className="h-12.5 w-screen bg-gradient-1 xl:h-22.5 sm:h-15 lg:h-20 2xl:h-25"
        delay={0}
      />
      <section className="mx-auto mt-12.5 grid min-h-[50vh] w-screen max-w-360 grid-cols-3 items-center gap-24 bg-white px-5 pt-7 pb-16 max-xl:grid-cols-3 max-lg:grid-cols-2 max-lg:gap-12 max-md:grid-cols-1 max-md:gap-8 max-md:px-5 max-sm:grid-cols-1">
        {pages.map((page: IPagesEntity, i: Key | number) => {
          return <LocationCard key={i} index={i as number} page={page} />;
        })}
      </section>
    </>
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
