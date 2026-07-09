import Link from 'next/link';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

/**
 * MastersCardInfo component displays information about a master on their card
 * @param   {object}           props        - Component properties
 * @param   {IAttributeValues} props.dict   - Dictionary containing localized texts
 * @param   {IAdminEntity}     props.master - Master entity containing personal and service information
 * @returns {JSX.Element}                   JSX element with master's information or empty fragment if no specialization
 */
const MastersCardInfo = ({
  dict,
  master,
}: {
  dict: IAttributeValues;
  master: IAdminEntity;
}): JSX.Element => {
  const { id, attributeValues } = master;
  /** Extract master's name from attributes */
  const name = attributeValues?.master_name?.value as string | undefined;
  /** Extract services from attributes */
  const services = attributeValues?.services?.value as
    Array<{ id: number; title: string }> | undefined;
  /** Find specialization from services with ID greater than 0 */
  const specialization = services?.find((el) => el.id > 0);
  /** Get localized text for "check profile" link */
  const checkProfileText = dict.check_profile_text?.value as string | undefined;

  /** Return empty fragment if no specialization found */
  if (!specialization) {
    return <></>;
  }
  return (
    <div className="gallery-card-info absolute bottom-0 left-0 w-full bg-transparent">
      <div className="gallery-card-content flex size-full flex-col gap-1 px-8 py-6 max-sm:px-5">
        <div className="text-xl leading-5 max-md:text-lg max-sm:text-base">
          {name}
        </div>
        <div className="text-sm leading-4 font-bold max-sm:text-xs">
          {specialization.title}
        </div>
        <Link
          href={`/masters/${id}?service=${specialization.id}`}
          className="text-sm underline hover:text-fuchsia-500 focus:outline-none max-sm:text-xs"
        >
          {checkProfileText}
        </Link>
      </div>
      <div className="gallery-card-info-bg"></div>
    </div>
  );
};

export default MastersCardInfo;
