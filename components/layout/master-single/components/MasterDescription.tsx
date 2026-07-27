import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { JSX } from 'react';

import { parseSafeCmsHtml } from '@/components/layout/master-single/utils/parseSafeCmsHtml';

/**
 * MasterDescription component to render the description of a master.
 *
 * This component displays the master's detailed description with HTML parsing.
 * It handles cases where description might not be available.
 * @param   {object}             props        - Component properties
 * @param   {IAdminEntity}       props.master - Master entity containing the description in attributeValues
 * @returns {JSX.Element | null}              JSX.Element representing the MasterDescription component or null if no description
 */
const MasterDescription = ({
  master,
}: {
  master: IAdminEntity;
}): JSX.Element => {
  /** Extract master description HTML from attribute values */
  const descArr = (master.attributeValues || {}).master_description?.value as
    Array<{ htmlValue?: string }> | undefined;

  const descriptionHtml = descArr?.[0]?.htmlValue;

  /** Render master description through the sanitizing allowlist parser */
  return (
    <div className="item mt-4 text-justify text-base leading-relaxed text-slate-400 max-md:max-w-full">
      {descriptionHtml ? parseSafeCmsHtml(descriptionHtml) : null}
    </div>
  );
};

export default MasterDescription;
