import type { JSX } from 'react';

import type { SimplePageProps } from '@/app/types/global';

/**
 * PaymentCanceled page component
 * Displays a page when a payment has been canceled by the user
 * @param   {SimplePageProps}      props      - Component properties
 * @param   {object}               props.page - Page data object containing localized information
 * @returns {Promise<JSX.Element>}            PaymentCanceled page component
 */
const PaymentCanceled = async ({
  page,
}: SimplePageProps): Promise<JSX.Element> => {
  /** Return empty fragment if no page data is provided */
  if (!page) {
    return <></>;
  }

  /**
   * Extract title from page localized information
   * This allows displaying the correct title based on the current locale
   */
  const {
    localizeInfos: { title },
  } = page;

  /** Render the payment canceled page with the localized title */
  return (
    <div className="flex flex-col pb-5 max-md:max-w-full">
      <h1 className="">{title}</h1>
    </div>
  );
};

export default PaymentCanceled;
