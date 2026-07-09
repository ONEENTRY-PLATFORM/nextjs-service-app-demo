import type { JSX } from 'react';

import type { SimplePageProps } from '@/app/types/global';

/**
 * Payment success page component
 *
 * This component renders the payment success page, displaying a confirmation
 * message to the user after a successful payment transaction.
 * @param   {object}               props      - Component properties
 * @param   {object}               props.page - Page entity containing localized information
 * @returns {Promise<JSX.Element>}            Payment success page with title, or undefined if no page data
 */
const PaymentSuccess = async ({
  page,
}: SimplePageProps): Promise<JSX.Element> => {
  if (!page) {
    return <></>;
  }

  /** Extract content from page localizeInfos */
  const {
    localizeInfos: { title },
  } = page;

  return (
    <div className="flex flex-col pb-5 max-md:max-w-full">
      <h1 className="">{title}</h1>
    </div>
  );
};

export default PaymentSuccess;
