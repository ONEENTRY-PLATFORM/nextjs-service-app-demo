import { notFound } from 'next/navigation';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import { type JSX, memo } from 'react';

import { getPageById, getPagesByIds } from '@/app/api';
import { getMastersList } from '@/app/api/utils/getMastersList';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { REVIEWS } from '@/components/layout/reviews-page/data';

import MasterAnimations from './animations/MasterAnimations';
import BackLink from './components/BackLink';
import BookingButton from './components/BookingButton';
import MasterDescription from './components/MasterDescription';
import MasterExperience from './components/MasterExperience';
import MasterName from './components/MasterName';
import MasterPortrait from './components/MasterPortrait';
import RatingCluster from './components/RatingCluster';
import SalonChip from './components/SalonChip';

/**
 * Master single page layout component.
 *
 * Renders the specialist profile per the reference design: a top gradient
 * strip, a "Back to Specialists" link, then a two-column profile card
 * (portrait + salon chips on the left, name/role/rating/experience/bio/booking
 * on the right). All CMS attributes are optional — the section degrades
 * gracefully when values are missing and only 404s when the admin itself is
 * absent.
 * @param   {object}               props                    - Component properties.
 * @param   {string}               props.handle             - Master identifier (numeric admin id).
 * @param   {object}               props.searchData         - Search parameters.
 * @param   {string}               props.searchData.service - Service (subcategory) page id, when navigated with context.
 * @returns {Promise<JSX.Element>}                          JSX.Element representing the master single page.
 */
const MasterSingleLayout = async ({
  handle,
  searchData,
}: {
  handle: string;
  searchData: { service: string };
}): Promise<JSX.Element> => {
  /** Fetch admin information including masters data */
  const { admins } = await getMastersList();
  /** Find the specific master by handle (ID) */
  const master = admins?.find(
    (admin: IAdminEntity) => admin.id === Number(handle),
  );

  /** Only a real master is required — 404 solely when the admin is missing. */
  if (!master) {
    return notFound();
  }

  /** Dictionary (booking button label) set upstream via ServerProvider. */
  const [dict] = ServerProvider<IAttributeValues>('dict');

  const attrs = master.attributeValues ?? {};

  /** Basic display attributes (all optional — fall back gracefully). */
  const name = (attrs.master_name?.value as string | undefined) ?? '';
  const imgArr = attrs.master_image?.value as
    Array<{ downloadLink?: string }> | undefined;
  const imageSrc = imgArr?.[0]?.downloadLink ?? '';
  const rating = Number(attrs.master_rating?.value) || 0;
  const experience =
    (attrs.master_expirience?.value as string | undefined) ?? '';
  const shortDescription =
    (attrs.master_short_description?.value as string | undefined) ?? '';

  /**
   * `master_services` links service PRODUCTS whose usable page id is
   * `value.parentId` (the products' subcategory page). It provides the role
   * fallback when the master has no short description; a numeric `?service=`
   * param overrides it.
   */
  const masterServices = attrs.master_services?.value as
    Array<{ value?: { parentId?: number } }> | undefined;
  const searchService = Number(searchData?.service);
  const serviceId =
    Number.isFinite(searchService) && searchService > 0
      ? searchService
      : masterServices?.[0]?.value?.parentId;

  /**
   * `master_salon` is an entity list `[{ title, value: { id } }]` pointing at
   * salon pages. We resolve those pages to enrich each chip with its
   * `salon_address` (falling back to title only when absent).
   */
  const salonArr = attrs.master_salon?.value as
    Array<{ title?: string; value?: { id?: number } }> | '' | undefined;
  const salonEntities = Array.isArray(salonArr) ? salonArr : [];
  const salonIds = salonEntities
    .map((entry) => entry.value?.id)
    .filter((id): id is number => typeof id === 'number');

  /** Service (role fallback) and salon pages (chip addresses) — independent. */
  const [serviceRes, salonRes] = await Promise.all([
    typeof serviceId === 'number' && Number.isFinite(serviceId) && serviceId > 0
      ? getPageById(serviceId)
      : Promise.resolve<{ page?: IPagesEntity | undefined }>({
          page: undefined,
        }),
    salonIds.length
      ? getPagesByIds(salonIds)
      : Promise.resolve<{ pages?: IPagesEntity[] | undefined }>({
          pages: undefined,
        }),
  ]);

  const service = serviceRes.page;
  const role = shortDescription || service?.localizeInfos?.title || '';

  /** Map salon page id → address/pageUrl for chip enrichment and links. */
  const salonPageById = new Map<number, { address: string; url: string }>();
  salonRes.pages?.forEach((page: IPagesEntity) => {
    const address =
      (page.attributeValues?.salon_address?.value as string | undefined) ?? '';
    salonPageById.set(page.id, { address, url: page.pageUrl });
  });
  const salonChips = salonEntities
    .map((entry) => {
      const id = entry.value?.id;
      const salonPage =
        typeof id === 'number' ? salonPageById.get(id) : undefined;
      return {
        title: entry.title ?? '',
        address: salonPage?.address || undefined,
        href: salonPage?.url ? `/salons/${salonPage.url}` : undefined,
      };
    })
    .filter((chip) => chip.title);

  /**
   * Review count for the header cluster — the reviews page runs on the local
   * mock dataset while the CMS reviews storage is empty, so the count comes
   * from the same source the "Reviews" link leads to.
   */
  const reviewsCount = REVIEWS.filter(
    (review) => review.master === name,
  ).length;

  return (
    <section className="bg-white" data-testid="master-page">
      {/* Top gradient strip (PINK2 → PINK → CYAN) */}
      <div className="h-1.25 w-full bg-gradient-stats" />

      {/* Back link on the site container rails */}
      <div className="mx-auto max-w-7xl px-3 pt-6 md:px-8">
        <BackLink />
      </div>

      {/* Profile card */}
      <div className="mx-auto max-w-7xl px-3 pt-10 pb-4 md:px-8 md:pb-12">
        <MasterAnimations className="grid grid-cols-1 items-start gap-8 md:grid-cols-[300px_1fr] md:gap-12">
          {/* Portrait column */}
          <div className="flex flex-col items-center md:items-start">
            <MasterPortrait imageSrc={imageSrc} alt={name} />
            {salonChips.length > 0 ? (
              <div
                className="item mt-5 flex w-full flex-col gap-2"
                style={{ maxWidth: 290 }}
              >
                {salonChips.map((chip, index) => (
                  <SalonChip
                    key={index}
                    title={chip.title}
                    address={chip.address}
                    href={chip.href}
                  />
                ))}
              </div>
            ) : null}
          </div>

          {/* Info column */}
          <div className="flex flex-col">
            <div className="item mb-1 flex flex-wrap items-start justify-between gap-4">
              <MasterName name={name} role={role} />
              <RatingCluster
                rating={rating}
                reviewsCount={reviewsCount}
                masterName={name}
              />
            </div>
            <MasterExperience experience={experience} />
            <MasterDescription master={master} />
            <BookingButton service={service} master={master} dict={dict} />
          </div>
        </MasterAnimations>
      </div>
    </section>
  );
};

export default memo(MasterSingleLayout);
