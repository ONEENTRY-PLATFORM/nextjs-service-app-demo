import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { JSX } from 'react';

import ReviewsIcon from '@/components/icons/reviews';
import StarsGroup from '@/components/shared/StarsGroup';

/**
 * MasterReviews component to display reviews and ratings for a master.
 *
 * This component displays the master's rating using star icons,
 * along with review statistics including total reviews count.
 * @param   {object}       props        - Component properties
 * @param   {IAdminEntity} props.master - Master entity containing rating attribute
 * @returns {JSX.Element}               JSX.Element representing the MasterReviews component or null if master is missing
 */
const MasterReviews = ({ master }: { master: IAdminEntity }): JSX.Element => {
  /** Return empty fragment if master data is not provided */
  if (!master) {
    return <></>;
  }

  /** Extract master rating from attribute values */
  const { master_rating } = master.attributeValues;
  /** Get rating value with fallback to 0 */
  const rating = (master_rating?.value as number | undefined) ?? 0;

  /** Render master reviews section with rating and review count */
  return (
    <div className="flex items-end gap-3.5 self-start whitespace-nowrap text-neutral-600">
      {/** Display star rating and total reviews count */}
      <div className="flex items-center justify-between gap-1.5 text-xl leading-6">
        <StarsGroup rating={rating} size={20} />
        <div className="self-stretch">527</div>
      </div>
      {/** Display reviews text and icon with specific review count */}
      <div className="mr-16 flex items-center gap-3.5">
        <div className="text-lg">Reviews</div>
        <div className="flex gap-2.5 leading-none">
          <ReviewsIcon size={6} />
          <div className="text-xl leading-5">27</div>
        </div>
      </div>
    </div>
  );
};

export default MasterReviews;
