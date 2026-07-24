'use client';

import dynamic from 'next/dynamic';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';
import { Suspense, useContext, useState } from 'react';

import { AuthContext } from '@/app/store/providers/AuthContext';
import AuthError from '@/components/pages/AuthError';
import SpinnerLoader from '@/components/shared/SpinnerLoader';

import StageFadeAnimations from './animations/StageFadeAnimations';
import MobileTabs, { type ProfileTab } from './components/MobileTabs';
import ProfileCard from './components/ProfileCard';
import VisitHistorySkeleton from './components/visit-section/VisitHistorySkeleton';

const ProfileHistory = dynamic(() => import('./components/ProfileHistory'), {
  ssr: true,
});

/**
 * ProfilePageLayout renders the account page: a Profile card and a visit-History
 * column side by side on large screens, with a mobile pill switcher between them
 * on small screens. Conditionally renders an auth error when the user or page is
 * unavailable.
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
  const { isAuth, isLoading, user } = useContext(AuthContext);
  /** Active mobile tab (Profile / History); ignored from `lg` up */
  const [mobileTab, setMobileTab] = useState<ProfileTab>('profile');

  /** Section labels from dictionary with fallbacks */
  const profileTitle =
    page?.localizeInfos?.title ||
    (dict.profile_title?.value as string | undefined) ||
    'Profile';
  const historyOfVisitsText =
    (dict.history_of_visits_text?.value as string | undefined) ||
    'History of visits';

  /**
   * While the session is being restored the auth state is unknown — show a
   * neutral spinner instead of the signed-out AuthError, which would otherwise
   * flash its "401" for a valid session on every load/refresh.
   */
  if (isLoading) {
    return (
      <div className="my-10 flex min-h-100 items-center justify-center">
        <SpinnerLoader />
      </div>
    );
  }

  /** Handle unauthenticated state or missing page/user data */
  if (!page || !isAuth || !user?.formData) {
    return <AuthError dict={dict} />;
  }

  return (
    <div className="my-10" data-testid="profile-page">
      {/* Mobile-only Profile / History switcher */}
      <MobileTabs
        active={mobileTab}
        onChange={setMobileTab}
        profileLabel={profileTitle}
        historyLabel={
          (dict.profile_history_tab?.value as string | undefined) || 'History'
        }
      />

      {/* 40 / 60 split on large screens; stacked / toggled on mobile */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
        {/* Profile card */}
        <StageFadeAnimations
          className={`lg:col-span-2 lg:block ${mobileTab === 'profile' ? 'block' : 'hidden'}`}
        >
          <ProfileCard dict={dict} page={page} user={user} />
        </StageFadeAnimations>

        {/* Visit history */}
        <StageFadeAnimations
          durations={{ load: 0.5, enter: 0.6, leave: 0.4 }}
          className={`lg:col-span-3 lg:block ${mobileTab === 'history' ? 'block' : 'hidden'}`}
        >
          <div
            className="relative box-border flex shrink-0 flex-col rounded-2xl bg-white p-6"
            style={{ boxShadow: '0 4px 24px rgba(237,33,241,0.08)' }}
          >
            <h2
              className="mb-5 font-light text-fuchsia-500"
              style={{ fontSize: '1.25rem' }}
            >
              {historyOfVisitsText}
            </h2>
            {/* ProfileHistory reads useSearchParams — it must sit under a
                Suspense boundary or the whole route bails out to CSR. */}
            <Suspense fallback={<VisitHistorySkeleton />}>
              <ProfileHistory dict={dict} masters={masters} />
            </Suspense>
          </div>
        </StageFadeAnimations>
      </div>
    </div>
  );
};

export default ProfilePageLayout;
