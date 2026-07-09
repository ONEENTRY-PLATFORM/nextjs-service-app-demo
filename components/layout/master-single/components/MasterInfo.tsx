import parse from 'html-react-parser';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';

/**
 * MasterInfo component to render information about a master.
 *
 * This component displays detailed information about a master including:
 * - Master's name
 * - Service specialization
 * - Working experience
 * @param   {object}                   props         - Component properties
 * @param   {IAdminEntity}             props.master  - Master entity containing various attributes like name, experience, etc.
 * @param   {IPagesEntity | undefined} props.service - Optional service information for specialization display
 * @returns {JSX.Element}                            JSX.Element representing the MasterInfo component or null if master is missing
 */
const MasterInfo = ({
  master,
  service,
}: {
  master: IAdminEntity;
  service?: IPagesEntity | undefined;
}): JSX.Element => {
  /** Return empty fragment if master data is not provided */
  if (!master) {
    return <></>;
  }

  /** Extract master attributes for display */
  const { master_name, master_expirience } = master.attributeValues;

  /** Get service title with fallback to empty string */
  const title = service?.localizeInfos.title ?? '';
  /** Get master experience with fallback to empty string */
  const exp = (master_expirience?.value as string | undefined) ?? '';
  /** Get master name with fallback to 'Unnamed' */
  const name = (master_name?.value as string | undefined) ?? 'Unnamed';

  /** Render master information including name, service title and experience */
  return (
    <div className="flex w-full flex-col">
      {/** Display master name */}
      <h2 className="mb-4 w-full text-3xl leading-5 text-slate-400 max-sm:text-2xl">
        {name}
      </h2>
      {/** Display master service title */}
      <p className="w-full text-xl text-fuchsia-500 max-sm:text-sm">
        {title} master
      </p>
      {/** Display master working experience */}
      <p className="w-full text-lg text-neutral-600 max-sm:mb-2.5 max-sm:text-sm">
        Working experience:{' '}
        <span className="font-bold text-neutral-600">{exp && parse(exp)}</span>
      </p>
    </div>
  );
};

export default MasterInfo;
