import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

import { getChildPagesByParentUrl, getPageByUrl } from '@/app/api';
import { getAdminsInfo } from '@/app/api/server/admins/getAdminsInfo';
import { getDictionary } from '@/app/api/utils/dictionaries';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import MastersGrid from '@/components/layout/masters-grid';
import GradientLine from '@/components/shared/GradientLine';

// export const revalidate = 10;
// export const dynamicParams = true;

/**
 * MastersPageLayout
 * @returns {Promise<JSX.Element>} MastersPage
 */
const MastersPageLayout = async (): Promise<JSX.Element> => {
  /** All four reads are independent — fetch them in parallel to cut TTFB. */
  const [dict, { page, isError }, { admins }, { pages, isError: err }] =
    await Promise.all([
      getDictionary(),
      getPageByUrl('masters'),
      getAdminsInfo({ body: [], offset: 0, limit: 100 }),
      getChildPagesByParentUrl('services'),
    ]);
  ServerProvider('dict', dict);

  if (!page || isError || !admins || err) {
    return notFound();
  }
  const masters = admins.filter(
    (master: IAdminEntity) => master.attributeValues?.master_name && master,
  );

  const mastersData =
    pages?.map((page: IPagesEntity) => {
      return {
        title: (page.localizeInfos?.title ?? '') + ' masters',
        specialization: {
          id: String(page.id),
          title: page.localizeInfos?.title ?? '',
          pageUrl: page.pageUrl,
        },
        cards: masters.filter((master: IAdminEntity) => {
          const services = master.attributeValues?.services?.value as
            { id: number }[] | '' | undefined;
          const sIds = (services !== '' && services?.map((s) => s.id)) || [];
          return sIds.includes(page.id);
        }),
      };
    }) ?? [];

  return (
    <div className="flex flex-col">
      <GradientLine />
      <MastersGrid mastersData={mastersData} />
    </div>
  );
};

export default MastersPageLayout;

/**
 * Generate page metadata
 * @async
 * @see {@link https://nextjs.org/docs/app/api-reference/file-conventions/page Next.js docs}
 * @returns {Promise<JSX.Element>} metadata
 */
export async function generateMetadata(): Promise<Metadata> {
  /** get page by Url */
  const { page, isError } = await getPageByUrl('masters');

  if (isError || !page) {
    return {};
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
