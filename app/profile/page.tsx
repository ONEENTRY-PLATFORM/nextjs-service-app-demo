import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { JSX } from 'react';

import { getAdminsInfo, getPageByUrl } from '@/app/api';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import ProfilePage from '@/components/layout/profile-page';
import AuthError from '@/components/pages/AuthError';
import GradientLine from '@/components/shared/GradientLine';

/**
 * ProfilePageLayout
 * @returns {Promise<JSX.Element>} ProfilePage
 */
const ProfilePageLayout = async (): Promise<JSX.Element> => {
  const [dict] = ServerProvider('dict', await getDictionary());
  const { page, isError } = await getPageByUrl('profile');
  /** masters */
  const { admins, isError: isErrorAdmins } = await getAdminsInfo({
    body: [],
    offset: 0,
    limit: 100,
  });

  if (!admins || isErrorAdmins) {
    return <></>;
  }

  const masters = admins.filter(
    (master: IAdminEntity) => master.attributeValues?.master_name && master,
  );

  if (!page || isError) {
    return <AuthError dict={dict} />;
  }

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
