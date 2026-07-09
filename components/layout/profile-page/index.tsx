'use client';

import dynamic from 'next/dynamic';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';
import { Suspense, useContext, useState } from 'react';

import { AuthContext } from '@/app/store/providers/AuthContext';
import { UserForm } from '@/components/forms';
import AuthError from '@/components/pages/AuthError';

import FromAnimations from './animations/FromAnimations';
import HistoryAnimations from './animations/HistoryAnimations';

const ProfileHistory = dynamic(() => import('./components/ProfileHistory'), {
  ssr: true,
});

const OrderStateSelect = dynamic(
  () => import('./components/OrderStateSelect'),
  { ssr: true },
);

/**
 * ProfilePageLayout component renders the user profile page with user form and order history.
 * It conditionally renders either the profile content or an authentication error based on user state.
 * @param   {object}           props         - Component props
 * @param   {IAttributeValues} props.dict    - Dictionary containing localized strings
 * @param   {IPagesEntity}     props.page    - Page entity containing page data
 * @param   {IAdminEntity[]}   props.masters - Array of master entities
 * @returns {JSX.Element}                    JSX element representing the profile page
 */
const ProfilePageLayout = ({
  dict,
  page,
  masters,
}: {
  dict: IAttributeValues;
  page: IPagesEntity;
  masters?: IAdminEntity[];
}): JSX.Element => {
  /** Get authentication state and user data from context */
  const { isAuth, user } = useContext(AuthContext);
  /** Track order state for history filtering (upcoming/completed) */
  const [orderState, setOrderState] = useState<string>('upcoming');
  /** Get history of visits text from dictionary with fallback */
  const historyOfVisitsText =
    (dict.history_of_visits_text?.value as string | undefined) ||
    'History of visits';

  /** Handle unauthenticated state or missing page/user data */
  if (!page || !isAuth || !user?.formData) {
    return <AuthError dict={dict} />;
  }

  /** Render profile page with user form and order history sections */
  return (
    <div className="my-10 flex justify-between gap-6 max-lg:flex-col max-lg:gap-20 max-md:gap-12">
      {/* User form section */}
      <FromAnimations className="flex w-4/12 flex-col max-lg:w-full">
        <h1 className="mb-8 text-4xl font-light capitalize">
          {page.localizeInfos?.title}
        </h1>
        <UserForm dict={dict} className={''} />
      </FromAnimations>

      {/* Order History Section */}
      <HistoryAnimations className="flex w-6/12 flex-col max-lg:w-full">
        <div className="relative box-border flex shrink-0 flex-col">
          <h2 className="mb-8 text-4xl font-light text-fuchsia-500">
            {historyOfVisitsText}
          </h2>
          <OrderStateSelect
            orderState={orderState}
            setOrderState={setOrderState}
          />
          <Suspense fallback={null}>
            <ProfileHistory
              dict={dict}
              eventType={orderState}
              masters={masters}
            />
          </Suspense>
        </div>
      </HistoryAnimations>
    </div>
  );
};

export default ProfilePageLayout;
