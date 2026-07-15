import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { JSX } from 'react';

import { getPageByUrl } from '@/app/api';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { getMastersList } from '@/app/api/utils/getMastersList';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import ProfilePage from '@/components/layout/profile-page';
import AuthError from '@/components/pages/AuthError';
import GradientLine from '@/components/shared/GradientLine';

/**
 * ProfilePageLayout
 * @returns {Promise<JSX.Element>} ProfilePage
 */
const ProfilePageLayout = async (): Promise<JSX.Element> => {
  /** These three requests are independent — fetch them in parallel, not in a waterfall. */
  const [dict, { page, isError }, { admins, isError: isErrorAdmins }] =
    await Promise.all([
      getDictionary(),
      getPageByUrl('profile'),
      getMastersList(),
    ]);

  /** Set dictionary for localization */
  ServerProvider('dict', dict);

  if (!page || isError) {
    return <AuthError dict={dict} />;
  }

  /**
   * Masters are secondary data for this page — if they fail to load, still
   * render the profile with an empty list instead of a blank page.
   */
  const masters =
    isErrorAdmins || !admins
      ? []
      : admins.filter(
          (master: IAdminEntity) =>
            master.attributeValues?.master_name && master,
        );

  return (
    <>
      <GradientLine />
      <section className="relative mx-auto flex w-full max-w-360 shrink-0 grow flex-col self-stretch p-5">
        <div className="flex w-full max-w-350 flex-col max-md:max-w-full">
          <ProfilePage dict={dict} page={page} masters={masters} />
        </div>
      </section>
    </>
  );
};

export default ProfilePageLayout;
