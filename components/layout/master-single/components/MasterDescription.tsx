import type { IAdminEntity } from 'oneentry/types';
import type { JSX } from 'react';

import { parseSafeCmsHtml } from '@/components/layout/master-single/utils/parseSafeCmsHtml';
import { firstAttrValue } from '@/components/utils/firstAttrValue';

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
  /**
   * Extract master description HTML from attribute values. The `text` block
   * comes as a one-element array, but `firstAttrValue` also accepts the bare
   * object the SDK contract allows.
   */
  const descriptionHtml = firstAttrValue<{ htmlValue?: string }>(
    (master.attributeValues || {}).master_description?.value,
  )?.htmlValue;

  /** Render master description through the sanitizing allowlist parser */
  return (
    <div className="item mt-4 text-justify text-base leading-relaxed text-slate-400 max-md:max-w-full">
      {descriptionHtml ? parseSafeCmsHtml(descriptionHtml) : null}
    </div>
  );
};

export default MasterDescription;
