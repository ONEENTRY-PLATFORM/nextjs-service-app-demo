import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { Dispatch, JSX, SetStateAction } from 'react';

import CardAnimations from '@/app/animations/CarouselCardAnimations';

import MasterCardImage from './MastersCardImage';
import MasterCardInfo from './MastersCardInfo';

/**
 * MastersFeedCard component displays an individual master's card in the carousel
 * @param   {object}                            props          - Component properties
 * @param   {IAttributeValues}                  props.dict     - Dictionary containing localized texts
 * @param   {IAdminEntity}                      props.master   - Master entity containing personal information
 * @param   {Dispatch<SetStateAction<boolean>>} props.setState - Function to update parent component state
 * @param   {number}                            props.index    - Index of the card in the carousel\
 * @returns {JSX.Element}                                      JSX element representing a master's card with image and information
 */
const MastersFeedCard = ({
  dict,
  master,
  setState,
  index,
}: {
  dict: IAttributeValues;
  master: IAdminEntity;
  setState: Dispatch<SetStateAction<boolean>>;
  index: number;
}): JSX.Element => {
  return (
    <div
      className="group relative flex h-80 min-w-[16.5vw] flex-col overflow-hidden max-xl:min-w-[25vw] max-xs:min-h-60 max-xs:min-w-[50vw] max-2xl:min-w-[20vw] max-lg:min-w-[25vw] max-md:h-70 max-md:min-h-65 max-md:min-w-[33.3333vw]"
      // Enable autoplay on pointer enter and disable on pointer leave
      onPointerEnter={() => setState(true)}
      onPointerLeave={() => setState(false)}
    >
      <CardAnimations
        className="relative flex size-full flex-col justify-center text-sm text-white"
        index={index}
        setState={setState}
      >
        <figure className="relative flex h-80 w-full flex-col overflow-hidden bg-slate-100 max-md:h-70">
          <MasterCardImage master={master} />
        </figure>
        <MasterCardInfo dict={dict} master={master} />
      </CardAnimations>
    </div>
  );
};

export default MastersFeedCard;
