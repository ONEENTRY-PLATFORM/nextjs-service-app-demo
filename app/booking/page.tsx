import type { JSX } from 'react';
import { Suspense } from 'react';

import { getPageByUrl } from '@/app/api';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import BookingAnimations from '@/components/forms/booking-form/animations/BookingAnimations';
import BookingForm from '@/components/forms/BookingForm';

/**
 * Sets the cache revalidation time for the page in seconds
 * A value of 10 means data will be revalidated every 10 seconds
 */
// export const revalidate = 10;

/**
 * Enables dynamic parameter generation
 * Allows dynamic route parameters that were not explicitly defined at build time
 */
export const dynamicParams = true;

/**
 * BookingPageLayout
 * @returns {Promise<JSX.Element>} JSX.Element representing the page
 */
const BookingPageLayout = async (): Promise<JSX.Element> => {
  /** Independent reads — run in parallel. */
  const [dictionary, pageResult] = await Promise.all([
    getDictionary(),
    getPageByUrl('booking'),
  ]);
  const [dict] = ServerProvider('dict', dictionary);
  const { page } = pageResult;

  return (
    <Suspense
      fallback={<div className={'min-h-screen min-w-full bg-gradient-2'} />}
    >
      <BookingAnimations className="flex flex-col justify-center">
        <div className="flex min-h-[70vh] w-full bg-gradient-2 px-5 py-10 text-white">
          <div className="mx-auto flex w-full max-w-lg flex-col">
            <h1 className="title mb-6 self-center text-center text-2xl font-bold uppercase">
              {page?.localizeInfos?.title}
            </h1>
            <BookingForm dict={dict} />
          </div>
        </div>
      </BookingAnimations>
    </Suspense>
  );
};

export default BookingPageLayout;
